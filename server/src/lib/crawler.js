import * as cheerio from 'cheerio';
import PQueue from 'p-queue';
import { domainOf, normalizeUrl, originOf, stripWww } from './url.js';
import { getCrawlCache, setCrawlCache } from './crawlCache.js';
import { settings } from '../config/env.js';

const UA = 'MakeFlowVisibilityBot/1.0';
const PRIORITY = ['about', 'services', 'service', 'what-we-do', 'contact', 'faq', 'pricing', 'locations', 'areas', 'team'];

const AU_ADDRESS =
  /\d+[A-Za-z]?\s+[\w\s]{2,40}(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Parade|Pde|Place|Pl|Court|Ct|Crescent|Cres|Highway|Hwy|Lane|Ln)\b[^,]{0,40}?(?:NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s+\d{4}/gi;
const PHONE = /(?:\+61\s?|0)[2-478](?:[\s-]?\d){8}|\(\d{2}\)\s?\d{4}\s?\d{4}/g;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

async function fetchLimited(url, { timeout = 10000, maxRedirects = 3, maxBytes = 2_000_000 } = {}) {
  let current = url;
  for (let i = 0; i <= maxRedirects; i++) {
    const res = await fetch(current, {
      redirect: 'manual',
      signal: AbortSignal.timeout(timeout),
      headers: { 'User-Agent': UA, Accept: 'text/html,text/plain,application/xml,*/*' },
    });
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get('location');
      if (!loc) return { ok: false, status: res.status, url: current, text: '' };
      current = new URL(loc, current).href;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      ok: res.ok,
      status: res.status,
      url: current,
      text: buf.subarray(0, maxBytes).toString('utf8'),
    };
  }
  return { ok: false, status: 0, url: current, text: '' };
}

function parseRobots(text) {
  const groups = [];
  let cur = { ua: [], disallow: [], allow: [], sitemaps: [] };
  for (const line of String(text || '').split(/\r?\n/)) {
    const t = line.replace(/#.*$/, '').trim();
    if (!t) continue;
    const idx = t.indexOf(':');
    if (idx < 0) continue;
    const key = t.slice(0, idx).trim().toLowerCase();
    const val = t.slice(idx + 1).trim();
    if (key === 'user-agent') {
      if (cur.ua.length) {
        groups.push(cur);
        cur = { ua: [], disallow: [], allow: [], sitemaps: cur.sitemaps };
      }
      cur.ua.push(val.toLowerCase());
    } else if (key === 'disallow') cur.disallow.push(val);
    else if (key === 'allow') cur.allow.push(val);
    else if (key === 'sitemap') cur.sitemaps.push(val);
  }
  groups.push(cur);
  return groups;
}

function groupFor(groups, ua) {
  const needle = ua.toLowerCase();
  return groups.find((g) => g.ua.some((u) => u === needle)) || groups.find((g) => g.ua.includes('*'));
}

function isDisallowed(groups, ua, pathname) {
  const g = groupFor(groups, ua);
  if (!g) return false;
  return g.disallow.some((d) => d && pathname.startsWith(d === '/' ? '/' : d));
}

function botBlocked(groups, bot) {
  const g = groupFor(groups, bot);
  if (!g) return false;
  return g.disallow.some((d) => d === '/' || d === '/*');
}

function extractPage(url, status, html) {
  const $ = cheerio.load(html || '');
  $('script, style, nav, footer, noscript, iframe').remove();
  const jsonld = [];
  let jsonldInvalid = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text();
    try {
      jsonld.push(JSON.parse(raw));
    } catch {
      jsonldInvalid = true;
    }
  });
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  const h = (sel) =>
    $(sel)
      .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
      .get()
      .filter(Boolean);
  const links_internal = [];
  const links_external = [];
  const host = stripWww(new URL(url).hostname);
  $('a[href]').each((_, el) => {
    try {
      const href = new URL($(el).attr('href'), url).href;
      const hst = stripWww(new URL(href).hostname);
      if (hst === host) links_internal.push(href);
      else links_external.push(href);
    } catch {
      /* skip */
    }
  });
  const qHeadings = [...h('h1'), ...h('h2'), ...h('h3')].filter((t) => t.endsWith('?')).length;
  const hasFaqPage = JSON.stringify(jsonld).toLowerCase().includes('faqpage');
  return {
    url,
    status,
    title: $('title').first().text().replace(/\s+/g, ' ').trim(),
    meta_description: $('meta[name="description"]').attr('content') || '',
    canonical: $('link[rel="canonical"]').attr('href') || '',
    h1: h('h1'),
    h2: h('h2'),
    h3: h('h3'),
    text: text.slice(0, 6000),
    word_count: text.split(/\s+/).filter(Boolean).length,
    jsonld,
    jsonld_invalid: jsonldInvalid,
    phones: [...new Set((html.match(PHONE) || []).map((s) => s.trim()))],
    emails: [...new Set((html.match(EMAIL) || []).map((s) => s.toLowerCase()))],
    addresses: [...new Set((html.match(AU_ADDRESS) || []).map((s) => s.trim()))],
    links_internal: [...new Set(links_internal)],
    links_external: [...new Set(links_external)],
    has_faq_markup: hasFaqPage || qHeadings >= 3,
    is_https: url.startsWith('https://'),
    has_viewport: Boolean($('meta[name="viewport"]').attr('content')),
  };
}

function collectTypes(nodes, acc = new Set()) {
  const list = Array.isArray(nodes) ? nodes : [nodes];
  for (const n of list) {
    if (!n || typeof n !== 'object') continue;
    const t = n['@type'];
    if (typeof t === 'string') acc.add(t);
    if (Array.isArray(t)) t.forEach((x) => acc.add(x));
    if (n['@graph']) collectTypes(n['@graph'], acc);
  }
  return acc;
}

function scoreReadiness({ pages, robotsMeta, llms, aiTxt, sitemap, serverRendered, blocked }) {
  if (blocked) {
    const keys = [
      ['schema_present', 'Structured data (JSON-LD)', 20],
      ['schema_types_correct', 'Correct schema types', 10],
      ['faq_content', 'FAQ content', 10],
      ['llms_txt', 'llms.txt / ai.txt', 10],
      ['ai_crawlers_allowed', 'AI crawlers allowed', 15],
      ['server_rendered', 'Server-rendered content', 10],
      ['clear_service_pages', 'Clear service pages', 15],
      ['nap_consistent', 'NAP consistency', 5],
      ['sitemap', 'Sitemap', 5],
    ];
    return {
      checks: keys.map(([key, label, max]) => ({
        key,
        label,
        status: 'unknown',
        points_awarded: 0,
        points_max: max,
        evidence: 'Site returned 403; could not audit',
      })),
      readability_score: 0,
      audit_incomplete: true,
    };
  }

  const types = new Set();
  let invalidLd = false;
  let faqPairs = 0;
  pages.forEach((p) => {
    collectTypes(p.jsonld, types);
    if (p.jsonld_invalid) invalidLd = true;
    if (p.has_faq_markup) faqPairs += 5;
    faqPairs += [...p.h2, ...p.h3].filter((t) => t.endsWith('?')).length;
  });
  const hasLd = pages.some((p) => p.jsonld?.length);
  const hasOrg = [...types].some((t) => /organization|localbusiness/i.test(t));
  const hasSvc = [...types].some((t) => /service|product/i.test(t));
  const servicePages = pages.filter((p) => /service/i.test(p.url + p.h1.join(' ')) && p.word_count >= 150);
  const strongServices = pages.filter((p) => /service/i.test(p.url + p.h1.join(' ')) && p.word_count >= 300);
  const phones = pages.flatMap((p) => p.phones);
  const addresses = pages.flatMap((p) => p.addresses);
  const phoneMode = modeShare(phones);
  const addrMode = modeShare(addresses);
  const gpt = robotsMeta.gptbot;
  const oai = robotsMeta.oai;

  const checks = [];
  function add(key, label, max, status, awarded, evidence) {
    checks.push({ key, label, status, points_awarded: awarded, points_max: max, evidence });
  }

  add(
    'schema_present',
    'Structured data (JSON-LD)',
    20,
    hasLd ? 'pass' : invalidLd ? 'partial' : 'fail',
    hasLd ? 20 : invalidLd ? 8 : 0,
    hasLd ? `Valid JSON-LD on ${pages.filter((p) => p.jsonld?.length).length} page(s)` : invalidLd ? 'Malformed JSON-LD present' : 'No JSON-LD found'
  );
  add(
    'schema_types_correct',
    'Correct schema types',
    10,
    hasOrg && hasSvc ? 'pass' : hasOrg || hasSvc ? 'partial' : 'fail',
    hasOrg && hasSvc ? 10 : hasOrg || hasSvc ? 5 : 0,
    [...types].slice(0, 8).join(', ') || 'None detected'
  );
  add(
    'faq_content',
    'FAQ content',
    10,
    faqPairs >= 5 ? 'pass' : faqPairs >= 1 ? 'partial' : 'fail',
    faqPairs >= 5 ? 10 : faqPairs >= 1 ? 4 : 0,
    faqPairs >= 5 ? 'FAQPage or ≥5 Q&A pairs' : faqPairs ? `${faqPairs} question-like heading(s)` : 'No FAQ content'
  );
  add(
    'llms_txt',
    'llms.txt / ai.txt',
    10,
    llms.ok && llms.text.length >= 100 ? 'pass' : aiTxt.ok ? 'partial' : 'fail',
    llms.ok && llms.text.length >= 100 ? 10 : aiTxt.ok ? 4 : 0,
    llms.ok && llms.text.length >= 100 ? `/llms.txt ${llms.status} (${llms.text.length} chars)` : aiTxt.ok ? '/ai.txt only' : 'Neither file present at root'
  );
  add(
    'ai_crawlers_allowed',
    'AI crawlers allowed',
    15,
    !gpt && !oai ? 'pass' : gpt !== oai ? 'partial' : 'fail',
    !gpt && !oai ? 15 : gpt !== oai ? 8 : 0,
    `GPTBot ${gpt ? 'disallowed' : 'allowed'}; OAI-SearchBot ${oai ? 'disallowed' : 'allowed'}`
  );
  const sr = serverRendered;
  add(
    'server_rendered',
    'Server-rendered content',
    10,
    sr >= 0.6 ? 'pass' : sr >= 0.3 ? 'partial' : 'fail',
    sr >= 0.6 ? 10 : sr >= 0.3 ? 5 : 0,
    `raw/rendered word ratio ${sr.toFixed(2)}`
  );
  add(
    'clear_service_pages',
    'Clear service pages',
    15,
    strongServices.length >= 3 ? 'pass' : servicePages.length >= 1 ? 'partial' : 'fail',
    strongServices.length >= 3 ? 15 : servicePages.length ? 6 : 0,
    `${strongServices.length} service page(s) ≥300 words; ${servicePages.length} ≥150 words`
  );
  const napStatus = !phones.length && !addresses.length ? 'unknown' : phoneMode >= 0.8 && addrMode >= 0.8 ? 'pass' : 'partial';
  add(
    'nap_consistent',
    'NAP consistency',
    5,
    napStatus,
    napStatus === 'pass' ? 5 : napStatus === 'partial' ? 2 : 0,
    phones[0] || addresses[0] || 'No phone/address found'
  );
  add(
    'sitemap',
    'Sitemap',
    5,
    sitemap.ok && /<urlset|<sitemapindex/i.test(sitemap.text) ? 'pass' : sitemap.status === 404 ? 'fail' : 'partial',
    sitemap.ok && /<urlset|<sitemapindex/i.test(sitemap.text) ? 5 : 0,
    sitemap.ok ? `sitemap.xml ${sitemap.status}` : `sitemap.xml ${sitemap.status || 'missing'}`
  );

  const httpsPages = pages.filter((p) => p.is_https && p.canonical && p.meta_description);
  add(
    'https_meta',
    'HTTPS, canonical, meta description',
    0,
    httpsPages.length / Math.max(1, pages.length) >= 0.8 ? 'pass' : 'partial',
    0,
    `${httpsPages.length}/${pages.length} pages have https + canonical + meta description`
  );

  const readability_score = checks.reduce((s, c) => s + (c.points_awarded || 0), 0);
  return { checks, readability_score, audit_incomplete: false };
}

function modeShare(arr) {
  if (!arr.length) return 1;
  const counts = {};
  arr.forEach((x) => {
    counts[x] = (counts[x] || 0) + 1;
  });
  return Math.max(...Object.values(counts)) / arr.length;
}

function linkScore(href, anchor = '') {
  const s = `${href} ${anchor}`.toLowerCase();
  const i = PRIORITY.findIndex((k) => s.includes(k));
  return i === -1 ? 99 : i;
}

export function trimSiteProfile(crawl, user) {
  return {
    domain: crawl.domain,
    crawl_status: crawl.crawl_status,
    pages: (crawl.pages || []).map((p) => ({
      url: p.url,
      title: p.title,
      h1: p.h1,
      h2: (p.h2 || []).slice(0, 8),
      text_excerpt: (p.text || '').slice(0, 1500),
    })),
    jsonld_types: crawl.jsonld_types || [],
    phones: crawl.phones || [],
    addresses: crawl.addresses || [],
    emails: [],
    llms_txt_excerpt: (crawl.llms_txt || '').slice(0, 800),
    user_provided: user,
  };
}

export async function crawlWebsite(website) {
  const fetchUrl = normalizeUrl(website, { keepWww: true });
  const domain = domainOf(fetchUrl);
  const cached = getCrawlCache(domain);
  if (cached) return cached;

  const origin = originOf(fetchUrl);
  const robotsRes = await fetchLimited(`${origin}/robots.txt`, { timeout: 6000 }).catch(() => ({ ok: false, text: '', status: 0 }));
  const groups = parseRobots(robotsRes.text);
  const robotsMeta = {
    gptbot: botBlocked(groups, 'gptbot'),
    oai: botBlocked(groups, 'oai-searchbot'),
    chatgpt: botBlocked(groups, 'chatgpt-user'),
    sitemaps: groups.flatMap((g) => g.sitemaps),
  };

  let home = await fetchLimited(fetchUrl).catch(() => ({ ok: false, status: 0, text: '', url: fetchUrl }));
  if (!home.ok || home.status >= 400) {
    const httpUrl = fetchUrl.replace(/^https:/, 'http:');
    home = await fetchLimited(httpUrl).catch(() => home);
  }

  if (!home.ok || home.status >= 400) {
    const blocked = {
      domain,
      crawl_status: 'blocked',
      pages: [],
      ...scoreReadiness({ pages: [], robotsMeta, llms: { ok: false, text: '' }, aiTxt: { ok: false }, sitemap: { ok: false }, serverRendered: 0, blocked: true }),
      jsonld_types: [],
      phones: [],
      addresses: [],
      llms_txt: '',
    };
    setCrawlCache(domain, blocked);
    return blocked;
  }

  const homePage = extractPage(home.url, home.status, home.text);
  const maxPages = settings().maxPages;
  const seen = new Set([normalizeUrl(home.url)]);
  const ranked = homePage.links_internal
    .map((href) => ({ href, score: linkScore(href) }))
    .sort((a, b) => a.score - b.score);

  const queue = new PQueue({ concurrency: 3 });
  const pages = [homePage];

  for (const { href } of ranked) {
    if (pages.length >= maxPages) break;
    let path = '/';
    try {
      path = new URL(href).pathname;
    } catch {
      continue;
    }
    if (isDisallowed(groups, 'makeflowvisibilitybot', path) && path !== '/') continue;
    const norm = normalizeUrl(href);
    if (seen.has(norm)) continue;
    seen.add(norm);
    queue.add(async () => {
      await new Promise((r) => setTimeout(r, 300));
      if (pages.length >= maxPages) return;
      const res = await fetchLimited(href).catch(() => null);
      if (!res?.ok) return;
      pages.push(extractPage(res.url, res.status, res.text));
    });
  }
  await queue.onIdle();

  const [llms, aiTxt, sitemapDirect] = await Promise.all([
    fetchLimited(`${origin}/llms.txt`, { timeout: 6000 }).catch(() => ({ ok: false, text: '', status: 0 })),
    fetchLimited(`${origin}/ai.txt`, { timeout: 6000 }).catch(() => ({ ok: false, text: '', status: 0 })),
    fetchLimited(`${origin}/sitemap.xml`, { timeout: 6000 }).catch(() => ({ ok: false, text: '', status: 0 })),
  ]);
  let sitemap = sitemapDirect;
  if (!sitemap.ok && robotsMeta.sitemaps[0]) {
    sitemap = await fetchLimited(robotsMeta.sitemaps[0], { timeout: 6000 }).catch(() => sitemap);
  }

  const rawWords = homePage.word_count;
  let renderedWords = rawWords;
  if (rawWords < 200) {
    try {
      const { chromium } = await import('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(home.url, { timeout: 15000, waitUntil: 'domcontentloaded' });
      const txt = await page.evaluate(() => document.body?.innerText || '');
      renderedWords = txt.split(/\s+/).filter(Boolean).length;
      await browser.close();
    } catch {
      renderedWords = Math.max(rawWords, 1);
    }
  }
  const serverRendered = rawWords / Math.max(renderedWords, 1);

  const types = new Set();
  pages.forEach((p) => collectTypes(p.jsonld, types));
  const audit = scoreReadiness({
    pages,
    robotsMeta,
    llms,
    aiTxt,
    sitemap,
    serverRendered,
    blocked: false,
  });

  const result = {
    domain,
    crawl_status: 'ok',
    pages,
    jsonld_types: [...types],
    phones: [...new Set(pages.flatMap((p) => p.phones))],
    addresses: [...new Set(pages.flatMap((p) => p.addresses))],
    llms_txt: llms.ok ? llms.text : '',
    server_rendered: serverRendered,
    ...audit,
  };
  setCrawlCache(domain, result);
  return result;
}
