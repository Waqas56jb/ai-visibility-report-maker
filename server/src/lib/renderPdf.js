import PDFDocument from 'pdfkit';
import { supabase } from '../supabase.js';
import { settings } from '../config/env.js';
import { SERVICES } from '../config/services.js';

const INK = '#0B1020';
const PAPER = '#F4F5FA';
const LINE = '#E6E9F2';
const TEXT = '#0F172A';
const MUTED = '#475569';
const CYAN = '#06B6D4';
const INDIGO = '#4F46E5';
const CORAL = '#F0625A';
const AMBER = '#F5B84B';
const MINT = '#22C55E';
const WHITE = '#FFFFFF';

function t(value) {
  return String(value ?? '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[^\x09\x0A\x0D\x20-\xFF]/g, '');
}

function scoreColor(n) {
  const v = Number(n) || 0;
  if (v <= 20) return CORAL;
  if (v <= 40) return AMBER;
  if (v <= 60) return CYAN;
  return MINT;
}

function left(doc) {
  return doc.page.margins.left;
}

function innerWidth(doc) {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

function remaining(doc) {
  return doc.page.height - doc.page.margins.bottom - doc.y;
}

function need(doc, h) {
  if (remaining(doc) < h) doc.addPage();
}

function decorate(doc, meta) {
  const { width, height, margins } = doc.page;
  const saved = { top: margins.top, bottom: margins.bottom, left: margins.left, right: margins.right };
  doc.page.margins = { top: 0, bottom: 0, left: 0, right: 0 };
  doc.save();
  doc.rect(0, 0, width, 46).fill(INK);
  doc.rect(0, 46, width, 3).fill(CYAN);
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(10).text('MAKEFLOW', 42, 18, { lineBreak: false });
  doc.fillColor('#67E8F9').font('Helvetica').fontSize(9).text('AI Visibility Report', 112, 18, { lineBreak: false });
  doc.fillColor('#ffffffcc').fontSize(8).text(t(meta.business), 42, 18, {
    align: 'right',
    width: width - 84,
    lineBreak: false,
  });
  doc.rect(0, height - 40, width, 40).fill(INK);
  doc.fillColor('#ffffff99').fontSize(7).font('Helvetica').text(
    `Tested against ChatGPT (browsing + knowledge)  ·  ${meta.date}  ·  Scores vary over time`,
    42,
    height - 24,
    { width: width - 120, lineBreak: false }
  );
  doc.fillColor(WHITE).text(String(doc.page.number), width - 54, height - 24, { width: 20, align: 'right', lineBreak: false });
  doc.restore();
  doc.page.margins = saved;
  doc.y = saved.top;
}

function sectionTitle(doc, title) {
  need(doc, 40);
  doc.moveDown(0.35);
  const y = doc.y;
  doc.rect(left(doc), y + 2, 3, 12).fill(INDIGO);
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(13).text(t(title), left(doc) + 12, y);
  doc.moveDown(0.35);
}

function body(doc, text, opts = {}) {
  doc.font('Helvetica').fontSize(opts.size || 9.5).fillColor(opts.color || MUTED).text(t(text), {
    width: opts.width || innerWidth(doc),
    align: opts.align || 'left',
    lineGap: 2,
  });
}

function barRow(doc, label, value, color) {
  need(doc, 22);
  const x = left(doc);
  const w = innerWidth(doc);
  const y = doc.y;
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  doc.font('Helvetica').fontSize(8.5).fillColor(TEXT).text(t(label), x, y, { width: 170 });
  doc.roundedRect(x + 178, y + 2, w - 220, 8, 4).fill(PAPER);
  doc.roundedRect(x + 178, y + 2, Math.max(4, ((w - 220) * pct) / 100), 8, 4).fill(color || INDIGO);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(INK).text(String(Math.round(pct)), x + w - 28, y, {
    width: 28,
    align: 'right',
  });
  doc.y = y + 18;
}

function kpiCards(doc, items) {
  need(doc, 78);
  const gap = 10;
  const n = items.length;
  const w = (innerWidth(doc) - gap * (n - 1)) / n;
  const y = doc.y;
  const x0 = left(doc);
  items.forEach((item, i) => {
    const x = x0 + i * (w + gap);
    doc.roundedRect(x, y, w, 70, 10).fill(WHITE);
    doc.roundedRect(x, y, w, 70, 10).lineWidth(1).strokeColor(LINE).stroke();
    doc.font('Helvetica').fontSize(7.5).fillColor(MUTED).text(t(item.label).toUpperCase(), x + 10, y + 12, {
      width: w - 20,
    });
    doc.font('Helvetica-Bold').fontSize(16).fillColor(INK).text(t(item.value), x + 10, y + 28, { width: w - 20 });
    if (item.hint) {
      doc.font('Helvetica').fontSize(7).fillColor(MUTED).text(t(item.hint), x + 10, y + 50, { width: w - 20 });
    }
  });
  doc.y = y + 82;
}

function checkRows(doc, checks) {
  checks.forEach((raw) => {
    const c = Array.isArray(raw)
      ? { status: raw[0], label: raw[1], evidence: raw[2], points: raw[3] }
      : {
          status: raw.status,
          label: raw.label,
          evidence: raw.evidence,
          points: `${raw.points_awarded ?? 0}/${raw.points_max ?? 0}`,
        };
    need(doc, 28);
    const y = doc.y;
    const x = left(doc);
    const color = c.status === 'pass' ? MINT : c.status === 'fail' ? CORAL : AMBER;
    doc.roundedRect(x, y, innerWidth(doc), 24, 6).fill(PAPER);
    doc.roundedRect(x + 8, y + 6, 12, 12, 3).fill(color);
    doc.font('Helvetica').fontSize(9).fillColor(TEXT).text(t(c.label), x + 28, y + 7, { width: innerWidth(doc) - 90 });
    doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(t(c.points || ''), x + innerWidth(doc) - 58, y + 8, {
      width: 50,
      align: 'right',
    });
    doc.y = y + 28;
  });
}

function table(doc, columns, rows) {
  const total = columns.reduce((s, c) => s + c.width, 0);
  const x0 = left(doc);
  need(doc, 28);
  let x = x0;
  const hy = doc.y;
  doc.rect(x0, hy, total, 20).fill(PAPER);
  columns.forEach((col) => {
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(MUTED).text(t(col.label).toUpperCase(), x + 6, hy + 6, {
      width: col.width - 12,
    });
    x += col.width;
  });
  doc.y = hy + 20;
  rows.forEach((row, i) => {
    need(doc, 22);
    const y = doc.y;
    if (row.highlight) doc.rect(x0, y, total, 22).fill('#EEF2FF');
    else if (i % 2 === 0) doc.rect(x0, y, total, 22).fill('#FAFBFF');
    let cx = x0;
    columns.forEach((col) => {
      doc.font(row.highlight || col.bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(8.5)
        .fillColor(TEXT)
        .text(t(row[col.key] ?? '—'), cx + 6, y + 6, { width: col.width - 12, align: col.align || 'left' });
      cx += col.width;
    });
    doc.y = y + 22;
  });
}

function recCard(doc, rec, index) {
  const title = rec.title || 'Recommendation';
  const why = rec.why || rec.why_it_matters || '';
  const how = rec.how || rec.what_to_do || '';
  const impact = rec.impact || rec.expected_impact || '';
  const effort = rec.effort || '';
  const service = rec.service || rec.service_key || '';
  const block = 18 + Math.ceil(t(why).length / 90) * 12 + (how ? Math.ceil(t(how).length / 90) * 12 : 0) + 28;
  need(doc, Math.min(block, 90));
  const y = doc.y;
  const w = innerWidth(doc);
  const x = left(doc);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text(`${index}. ${t(title)}`, x, y, { width: w });
  if (why) {
    doc.moveDown(0.15);
    body(doc, why, { size: 8.5 });
  }
  if (how) {
    doc.moveDown(0.08);
    body(doc, `Do this: ${how}`, { size: 8.5, color: TEXT });
  }
  doc.moveDown(0.15);
  const chips = [impact && `${impact} impact`, effort && `${effort} effort`, service].filter(Boolean);
  let cx = x;
  const cy = doc.y;
  chips.forEach((chip) => {
    const tw = doc.font('Helvetica').fontSize(7).widthOfString(t(chip)) + 14;
    doc.roundedRect(cx, cy, tw, 14, 7).lineWidth(0.8).strokeColor(LINE).stroke();
    doc.fillColor(service && chip === service ? INDIGO : MUTED).text(t(chip), cx + 7, cy + 3);
    cx += tw + 6;
  });
  doc.y = cy + 22;
}

function drawReport(doc, report) {
  const score = report.overall_score ?? 0;
  const band = report.score_band || '—';
  const metrics = report.metrics || {};
  const website = String(report.website || '').replace(/^https?:\/\//, '');
  const date = report.created_at
    ? new Date(report.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

  doc.y = 64;
  doc.font('Helvetica').fontSize(8).fillColor(CYAN).text('AI VISIBILITY REPORT  ·  TESTED AGAINST CHATGPT');
  doc.moveDown(0.25);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(INK).text(t(report.business_name || 'Business'), {
    width: innerWidth(doc),
  });
  doc.moveDown(0.15);
  body(doc, [website, report.industry, report.city_region, date].filter(Boolean).join('  ·  '), { size: 9 });
  doc.moveDown(0.6);

  need(doc, 120);
  const heroY = doc.y;
  const heroW = innerWidth(doc);
  const heroX = left(doc);
  doc.roundedRect(heroX, heroY, heroW, 108, 14).fill(INK);
  doc.roundedRect(heroX, heroY, 6, 108, 3).fill(scoreColor(score));
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(46).text(String(score), heroX + 24, heroY + 22);
  doc.font('Helvetica').fontSize(10).fillColor('#ffffff88').text('/ 100', heroX + 24, heroY + 72);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(WHITE).text(t(band), heroX + 150, heroY + 28, { width: heroW - 180 });
  doc.font('Helvetica').fontSize(9).fillColor('#ffffffaa').text(
    'Overall visibility in ChatGPT answers for discovery, comparison, local and brand questions.',
    heroX + 150,
    heroY + 52,
    { width: heroW - 180 }
  );
  doc.y = heroY + 122;

  kpiCards(doc, [
    { label: 'Mention rate', value: metrics.mention_rate != null ? `${metrics.mention_rate}%` : '—', hint: metrics.mention_label },
    { label: 'Avg position', value: metrics.avg_position ?? '—', hint: 'when mentioned' },
    { label: 'Citations', value: metrics.citations ?? '—', hint: 'browsing answers' },
    { label: 'AI-readiness', value: report.readability_score != null ? `${report.readability_score}/100` : '—', hint: 'website audit' },
  ]);

  if (report.executive_summary) {
    sectionTitle(doc, 'Executive summary');
    body(doc, report.executive_summary, { size: 10, color: TEXT });
  }

  const modes = report.score_by_mode || [];
  const cats = report.score_by_category || [];
  if (modes.length || cats.length) {
    sectionTitle(doc, 'Where the score comes from');
    if (modes.length) {
      body(doc, 'Score by mode', { size: 8, color: MUTED });
      doc.moveDown(0.2);
      modes.forEach((m) => barRow(doc, m.name, m.value, INDIGO));
      doc.moveDown(0.3);
    }
    if (cats.length) {
      body(doc, 'Score by question category', { size: 8, color: MUTED });
      doc.moveDown(0.2);
      cats.forEach((m, i) => barRow(doc, m.name, m.value, [CORAL, AMBER, CYAN, MINT, INDIGO][i % 5]));
    }
  }

  const weights = report.weights || metrics.weights || [];
  if (weights.length) {
    sectionTitle(doc, 'How the score is built');
    table(
      doc,
      [
        { label: 'Component', key: 'name', width: 220 },
        { label: 'Weight', key: 'weight', width: 90 },
        { label: 'Score', key: 'score', width: 90 },
      ],
      weights.map((w) => ({ name: w.name, weight: w.weight, score: w.score }))
    );
  }

  const checks = report.ai_readiness?.checks || [];
  if (checks.length) {
    sectionTitle(doc, `Website AI-readiness${report.readability_score != null ? `  ${report.readability_score}/100` : ''}`);
    body(doc, 'Technical signals that help ChatGPT find, trust and cite this website.');
    doc.moveDown(0.25);
    checkRows(doc, checks);
  }

  const comps = report.competitors || report.result_competitors || report.competitors_result || [];
  if (comps.length) {
    sectionTitle(doc, 'Competitors ChatGPT recommends');
    table(
      doc,
      [
        { label: 'Business', key: 'name', width: 200 },
        { label: 'Mention rate', key: 'mention', width: 100 },
        { label: 'Avg pos', key: 'pos', width: 80 },
        { label: 'Share of voice', key: 'sov', width: 110 },
      ],
      comps.map((c) => ({
        name: c.you ? `${c.name} (you)` : c.name,
        mention: c.mention_rate != null ? `${c.mention_rate}%` : '—',
        pos: c.avg_position ?? '—',
        sov: c.share_of_voice != null ? `${c.share_of_voice}%` : '—',
        highlight: !!c.you,
      }))
    );
  }

  const gaps = (report.gaps || []).slice(0, 8);
  if (gaps.length) {
    sectionTitle(doc, 'Highest-value gaps');
    body(doc, 'Questions where ChatGPT named someone else instead of you.');
    doc.moveDown(0.25);
    gaps.forEach((g, i) => {
      need(doc, 42);
      const named = (g.named_instead || g.competitors_named || []).slice(0, 3).join(', ');
      doc.font('Helvetica-Bold').fontSize(9).fillColor(INK).text(`${i + 1}. ${t(g.question || g.query || '')}`, {
        width: innerWidth(doc),
      });
      body(doc, [g.category, g.mode, named && `Named instead: ${named}`].filter(Boolean).join('  ·  '), { size: 8 });
      doc.moveDown(0.2);
    });
  }

  const recs = report.recommendations || [];
  if (recs.length) {
    sectionTitle(doc, 'Prioritised recommendations');
    recs.slice(0, 10).forEach((r, i) => recCard(doc, r, i + 1));
  }

  const help = report.how_makeflow_helps?.length
    ? report.how_makeflow_helps
    : Object.keys(SERVICES).map((key) => ({
        service_key: key,
        name: SERVICES[key].name,
        description: SERVICES[key].description,
        items: recs.filter((r) => (r.service || r.service_key) === key).map((r) => r.title),
      })).filter((g) => g.items?.length);

  if (help.length) {
    sectionTitle(doc, 'How MakeFlow can fix this');
    help.forEach((g) => {
      need(doc, 40);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(INDIGO).text(t(g.name || g.title || g.service_key));
      if (g.description || g.body) body(doc, g.description || g.body, { size: 8 });
      (g.items || []).forEach((item) => {
        doc.font('Helvetica').fontSize(8.5).fillColor(TEXT).text(`  •  ${t(item)}`, { width: innerWidth(doc) });
      });
      doc.moveDown(0.25);
    });
  }

  need(doc, 50);
  doc.moveDown(0.6);
  doc.roundedRect(left(doc), doc.y, innerWidth(doc), 48, 10).fill(PAPER);
  const fy = doc.y + 12;
  doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(
    t(
      `Methodology: ${metrics.opportunity_count || 0} opportunity questions tested against ChatGPT in browsing and knowledge modes. AI answers are non-deterministic; re-run later to track change. This report is for the business owner and is not a guarantee of ranking.`
    ),
    left(doc) + 12,
    fy,
    { width: innerWidth(doc) - 24 }
  );
}

export function pdfFilename(report) {
  const slug = String(report.business_name || 'report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return `MakeFlow-AI-Visibility-${slug || 'report'}.pdf`;
}

export function buildPdfBuffer(report) {
  const date = report.created_at
    ? new Date(report.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  const meta = { business: report.business_name || 'MakeFlow', date };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 64, bottom: 56, left: 42, right: 42 },
      info: {
        Title: `${report.business_name || 'Business'} — AI Visibility Report`,
        Author: 'MakeFlow',
        Subject: 'ChatGPT AI visibility report',
      },
    });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    decorate(doc, meta);
    doc.on('pageAdded', () => decorate(doc, meta));
    drawReport(doc, report);
    doc.end();
  });
}

export function sendPdf(res, buffer, filename) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', buffer.length);
  res.send(buffer);
}

export async function renderPdf(report, extras = {}) {
  const data = { ...report, ...extras };
  const buffer = await buildPdfBuffer(data);
  const bucket = settings().bucket;
  const path = `${report.id || data.id}.pdf`;
  try {
    await supabase.storage.from(bucket).upload(path, buffer, { contentType: 'application/pdf', upsert: true });
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    return pub?.publicUrl || null;
  } catch {
    return null;
  }
}
