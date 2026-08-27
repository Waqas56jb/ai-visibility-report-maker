import PDFDocument from 'pdfkit';
import { supabase } from '../supabase.js';
import { settings } from '../config/env.js';
import { SERVICES } from '../config/services.js';

const INK = '#0B1020';
const PAPER = '#F3F4F8';
const LINE = '#D9DEEA';
const TEXT = '#0F172A';
const MUTED = '#5B6578';
const CYAN = '#06B6D4';
const INDIGO = '#4F46E5';
const CORAL = '#F0625A';
const AMBER = '#F5B84B';
const MINT = '#22C55E';
const WHITE = '#FFFFFF';
const ML = 36;
const MR = 36;
const MT = 58;
const MB = 46;

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

function cw(doc) {
  return doc.page.width - ML - MR;
}

function rest(doc) {
  return doc.page.height - MB - doc.y;
}

function need(doc, h) {
  if (rest(doc) < h) doc.addPage();
}

function tx(doc, str, x, y, opts = {}) {
  doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(opts.size || 9)
    .fillColor(opts.color || TEXT)
    .text(t(str), x, y, {
      width: opts.width,
      align: opts.align || 'left',
      lineGap: opts.lineGap ?? 1.5,
      ellipsis: opts.ellipsis,
      height: opts.height,
    });
  doc.x = ML;
}

function textH(doc, str, width, size, bold = false) {
  return doc
    .font(bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(size)
    .heightOfString(t(str), { width, lineGap: 1.5 });
}

let decorating = false;

function decorate(doc, meta) {
  if (decorating) return;
  decorating = true;
  const { width, height } = doc.page;
  const saved = { ...doc.page.margins };
  doc.page.margins = { top: 0, bottom: 0, left: 0, right: 0 };
  doc.save();
  doc.rect(0, 0, width, height).fill(PAPER);
  doc.rect(0, 0, width, 50).fill(INK);
  doc.rect(0, 50, width, 2.5).fill(CYAN);
  tx(doc, 'MAKEFLOW', 36, 18, { bold: true, size: 10, color: WHITE, width: 80 });
  tx(doc, 'AI Visibility Report', 108, 19, { size: 9, color: '#67E8F9', width: 200 });
  tx(doc, meta.business || 'MakeFlow', 36, 19, { size: 9, color: '#C7D2FE', width: width - 72, align: 'right' });
  doc.rect(0, height - 42, width, 42).fill(INK);
  tx(
    doc,
    `Confidential  ·  Tested against ChatGPT  ·  ${meta.date || ''}  ·  Snapshot only, re-run to track change`,
    36,
    height - 26,
    { size: 7, color: '#94A3B8', width: width - 90, height: 12 }
  );
  tx(doc, String(doc.page.number), width - 52, height - 26, { size: 8, color: WHITE, width: 20, align: 'right', height: 12 });
  doc.restore();
  doc.page.margins = saved;
  doc.x = ML;
  doc.y = MT;
  decorating = false;
}

function heading(doc, title) {
  need(doc, 26);
  const y = doc.y;
  doc.rect(ML, y + 1, 3, 11).fill(INDIGO);
  tx(doc, title, ML + 10, y, { bold: true, size: 11, color: INK, width: cw(doc) - 10 });
  doc.y = y + 16;
}

function chip(doc, label, x, y, color = MUTED) {
  const pad = 7;
  const w = doc.font('Helvetica').fontSize(7).widthOfString(t(label)) + pad * 2;
  doc.roundedRect(x, y, w, 12, 6).fill('#EEF1F7');
  tx(doc, label, x + pad, y + 2, { size: 7, color });
  return w + 5;
}

function bar(doc, x, y, w, pct, color) {
  doc.roundedRect(x, y, w, 6, 3).fill('#E6E9F2');
  doc.roundedRect(x, y, Math.max(3, (w * Math.max(0, Math.min(100, pct))) / 100), 6, 3).fill(color);
}

function ring(doc, cx, cy, r, pct, color) {
  doc.save();
  doc.circle(cx, cy, r).lineWidth(8).strokeColor('#1E2745').stroke();
  const p = Math.max(0.01, Math.min(0.999, (Number(pct) || 0) / 100));
  const start = -Math.PI / 2;
  const end = start + Math.PI * 2 * p;
  const large = p > 0.5 ? 1 : 0;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  doc
    .path(`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`)
    .lineWidth(8)
    .lineCap('round')
    .strokeColor(color)
    .stroke();
  doc.restore();
}

function kpiStrip(doc, items, y) {
  const gap = 8;
  const w = (cw(doc) - gap * 3) / 4;
  items.forEach((item, i) => {
    const x = ML + i * (w + gap);
    doc.roundedRect(x, y, w, 54, 8).fill(WHITE);
    doc.roundedRect(x, y, w, 54, 8).lineWidth(0.6).strokeColor(LINE).stroke();
    doc.rect(x, y, 3, 54).fill(item.color || INDIGO);
    tx(doc, item.label, x + 10, y + 8, { size: 6.5, color: MUTED, width: w - 16 });
    tx(doc, item.value, x + 10, y + 20, { bold: true, size: 15, color: INK, width: w - 16 });
    tx(doc, item.hint || '', x + 10, y + 38, { size: 6.5, color: MUTED, width: w - 16, height: 10, ellipsis: true });
  });
  return y + 62;
}

function drawTable(doc, cols, rows) {
  const total = cw(doc);
  const sum = cols.reduce((s, c) => s + c.w, 0);
  const scaled = cols.map((c) => ({ ...c, w: (c.w / sum) * total }));
  need(doc, 22 + rows.length * 18);
  let y = doc.y;
  doc.rect(ML, y, total, 17).fill(INK);
  let x = ML;
  scaled.forEach((c) => {
    tx(doc, c.l, x + 8, y + 4, { size: 6.5, color: '#94A3B8', width: c.w - 12 });
    x += c.w;
  });
  y += 17;
  rows.forEach((row) => {
    const bg = row._you ? '#E0E7FF' : row._alt ? WHITE : '#F7F8FC';
    doc.rect(ML, y, total, 18).fill(bg);
    x = ML;
    row.cells.forEach((v, ci) => {
      tx(doc, v, x + 8, y + 4, { size: 8, color: TEXT, width: scaled[ci].w - 12, bold: ci === 0 || row._you });
      x += scaled[ci].w;
    });
    y += 18;
  });
  doc.y = y + 10;
}

function drawReport(doc, report) {
  const score = Number(report.overall_score) || 0;
  const band = report.score_band || '—';
  const metrics = report.metrics || {};
  const website = String(report.website || '').replace(/^https?:\/\//, '');
  const accent = scoreColor(score);
  const date = report.created_at
    ? new Date(report.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const heroY = doc.y;
  const heroH = 148;
  doc.roundedRect(ML, heroY, cw(doc), heroH, 12).fill(INK);
  ring(doc, ML + 70, heroY + 74, 42, score, accent);
  tx(doc, String(score), ML + 42, heroY + 54, { bold: true, size: 26, color: WHITE, width: 56, align: 'center' });
  tx(doc, '/100', ML + 42, heroY + 84, { size: 8, color: '#94A3B8', width: 56, align: 'center' });

  const rx = ML + 132;
  const ry = heroY + 16;
  tx(doc, 'OVERALL AI VISIBILITY', rx, ry, { size: 7, color: CYAN, width: 360 });
  tx(doc, t(report.business_name || 'Business'), rx, ry + 12, { bold: true, size: 17, color: WHITE, width: 360 });
  tx(doc, [website, report.industry, report.city_region, date].filter(Boolean).join('  ·  '), rx, ry + 34, {
    size: 8,
    color: '#94A3B8',
    width: 360,
  });
  const bandW = Math.min(160, doc.font('Helvetica-Bold').fontSize(9).widthOfString(t(band)) + 22);
  doc.roundedRect(rx, ry + 50, bandW, 16, 8).fill(accent);
  tx(doc, band, rx, ry + 53, { bold: true, size: 8.5, color: INK, width: bandW, align: 'center' });
  tx(
    doc,
    'How often ChatGPT names this business when Australians ask for recommendations in browsing and knowledge modes.',
    rx,
    ry + 76,
    { size: 8, color: '#CBD5E1', width: 360 }
  );
  doc.y = heroY + heroH + 10;

  doc.y = kpiStrip(doc, [
    { label: 'MENTION RATE', value: metrics.mention_rate != null ? `${metrics.mention_rate}%` : '—', hint: metrics.mention_label || 'of opportunity queries', color: INDIGO },
    { label: 'AVG POSITION', value: metrics.avg_position ?? '—', hint: 'when you are named', color: CYAN },
    { label: 'CITATIONS', value: metrics.citations ?? '—', hint: 'browsing answers with a link', color: MINT },
    { label: 'AI-READINESS', value: report.readability_score != null ? `${report.readability_score}/100` : '—', hint: 'website technical audit', color: AMBER },
  ], doc.y);

  if (report.executive_summary) {
    heading(doc, 'Executive summary');
    const textW = cw(doc) - 28;
    const h = Math.max(42, Math.min(textH(doc, report.executive_summary, textW, 9) + 20, 110));
    need(doc, h + 8);
    const boxY = doc.y;
    doc.roundedRect(ML, boxY, cw(doc), h, 8).fill(WHITE);
    doc.roundedRect(ML, boxY, cw(doc), h, 8).lineWidth(0.6).strokeColor(LINE).stroke();
    doc.rect(ML, boxY, 3.5, h).fill(INDIGO);
    tx(doc, report.executive_summary, ML + 14, boxY + 10, { size: 9, color: TEXT, width: textW, height: h - 16 });
    doc.y = boxY + h + 10;
  }

  const modes = report.score_by_mode || [];
  const cats = report.score_by_category || [];
  if (modes.length || cats.length) {
    heading(doc, 'Score breakdown');
    const colW = (cw(doc) - 12) / 2;
    const rows = Math.max(modes.length, cats.length);
    need(doc, 18 + rows * 22);
    const startY = doc.y;
    let leftY = startY;
    let rightY = startY;
    if (modes.length) {
      tx(doc, 'BY MODE', ML, leftY, { size: 6.5, color: MUTED, width: colW });
      leftY += 12;
      modes.forEach((m) => {
        tx(doc, m.name, ML, leftY, { size: 8, color: TEXT, width: colW - 32 });
        tx(doc, String(m.value ?? 0), ML + colW - 26, leftY, { bold: true, size: 8, color: INK, width: 26, align: 'right' });
        bar(doc, ML, leftY + 11, colW, m.value, INDIGO);
        leftY += 22;
      });
    }
    if (cats.length) {
      const x = ML + colW + 12;
      tx(doc, 'BY QUESTION CATEGORY', x, rightY, { size: 6.5, color: MUTED, width: colW });
      rightY += 12;
      cats.forEach((m, i) => {
        const color = [CORAL, AMBER, CYAN, MINT, INDIGO][i % 5];
        tx(doc, m.name, x, rightY, { size: 8, color: TEXT, width: colW - 32 });
        tx(doc, String(m.value ?? 0), x + colW - 26, rightY, { bold: true, size: 8, color: INK, width: 26, align: 'right' });
        bar(doc, x, rightY + 11, colW, m.value, color);
        rightY += 22;
      });
    }
    doc.y = Math.max(leftY, rightY) + 4;
  }

  const weights = report.weights || metrics.weights || [];
  if (weights.length) {
    heading(doc, 'How the score is built');
    drawTable(
      doc,
      [
        { l: 'COMPONENT', w: 260 },
        { l: 'WEIGHT', w: 90 },
        { l: 'SCORE', w: 90 },
      ],
      weights.map((row, i) => ({
        _alt: i % 2 === 1,
        cells: [row.name, row.weight, row.score == null ? '—' : `${row.score}`],
      }))
    );
  }

  const checks = report.ai_readiness?.checks || [];
  if (checks.length) {
    heading(doc, `Website AI-readiness${report.readability_score != null ? `  ·  ${report.readability_score}/100` : ''}`);
    const colW = (cw(doc) - 8) / 2;
    const rowH = 20;
    checks.forEach((raw, i) => {
      const c = Array.isArray(raw)
        ? { status: raw[0], label: raw[1], points: raw[3] || raw[2] }
        : { status: raw.status, label: raw.label, points: `${raw.points_awarded ?? 0}/${raw.points_max ?? 0}` };
      const col = i % 2;
      if (col === 0) need(doc, rowH);
      const y = doc.y;
      const x = ML + col * (colW + 8);
      const color = c.status === 'pass' ? MINT : c.status === 'fail' ? CORAL : AMBER;
      doc.roundedRect(x, y, colW, 18, 5).fill(WHITE);
      doc.roundedRect(x + 6, y + 4, 9, 9, 2).fill(color);
      tx(doc, c.label, x + 20, y + 4, { size: 7.5, color: TEXT, width: colW - 64, height: 11, ellipsis: true });
      tx(doc, c.points || '', x + colW - 40, y + 4, { size: 7, color: MUTED, width: 34, align: 'right' });
      if (col === 1 || i === checks.length - 1) doc.y = y + rowH;
      else doc.y = y;
    });
    doc.y += 6;
  }

  const comps = report.competitors || report.result_competitors || report.competitors_result || [];
  if (comps.length) {
    heading(doc, 'Competitors ChatGPT recommends');
    drawTable(
      doc,
      [
        { l: 'BUSINESS', w: 210 },
        { l: 'MENTION', w: 80 },
        { l: 'AVG POS', w: 70 },
        { l: 'SHARE OF VOICE', w: 110 },
      ],
      comps.map((c, i) => ({
        _you: !!c.you,
        _alt: i % 2 === 1,
        cells: [
          c.you ? `${c.name}  (you)` : c.name,
          c.mention_rate != null ? `${c.mention_rate}%` : '—',
          c.avg_position != null && c.avg_position !== '' ? c.avg_position : '—',
          c.share_of_voice != null ? `${c.share_of_voice}%` : '—',
        ],
      }))
    );
  }

  const gaps = (report.gaps || []).slice(0, 12);
  if (gaps.length) {
    heading(doc, 'Highest-value gaps');
    tx(doc, 'Questions where ChatGPT named someone else, or nobody at all, instead of you.', ML, doc.y, {
      size: 7.5,
      color: MUTED,
      width: cw(doc),
    });
    const colW = (cw(doc) - 8) / 2;
    const rowH = 36;
    gaps.forEach((g, i) => {
      const named = (g.named_instead || g.competitors_named || []).filter(Boolean).slice(0, 3);
      const col = i % 2;
      if (col === 0) need(doc, rowH);
      const y = doc.y;
      const x = ML + col * (colW + 8);
      doc.roundedRect(x, y, colW, 32, 6).fill(WHITE);
      doc.roundedRect(x, y, colW, 32, 6).lineWidth(0.5).strokeColor(LINE).stroke();
      tx(doc, `${i + 1}.  ${g.question || g.query || ''}`, x + 8, y + 5, {
        size: 7.5,
        color: TEXT,
        width: colW - 16,
        height: 11,
        ellipsis: true,
        bold: true,
      });
      const metaLine = [g.category, g.mode].filter(Boolean).join(' · ');
      const namedLine = named.length ? named.join(', ') : 'No one named';
      tx(doc, `${metaLine}${metaLine ? '  ·  ' : ''}${namedLine}`, x + 8, y + 18, {
        size: 6.5,
        color: named.length ? CORAL : MUTED,
        width: colW - 16,
        height: 10,
        ellipsis: true,
      });
      if (col === 1 || i === gaps.length - 1) doc.y = y + rowH;
      else doc.y = y;
    });
  }

  const recs = report.recommendations || [];
  if (recs.length) {
    heading(doc, 'Prioritised recommendations');
    recs.slice(0, 8).forEach((r, i) => {
      const why = r.why || r.why_it_matters || '';
      const how = r.how || r.what_to_do || '';
      const w = cw(doc);
      const inner = w - 44;
      const whyH = why ? textH(doc, why, inner, 8) : 0;
      const howH = how ? textH(doc, `Do this: ${how}`, inner, 8) : 0;
      const boxH = 16 + 14 + whyH + (whyH ? 4 : 0) + howH + (howH ? 4 : 0) + 18;
      need(doc, boxH + 6);
      const y = doc.y;
      doc.roundedRect(ML, y, w, boxH, 8).fill(WHITE);
      doc.roundedRect(ML, y, w, boxH, 8).lineWidth(0.6).strokeColor(LINE).stroke();
      doc.rect(ML, y, 3.5, boxH).fill(INDIGO);
      doc.circle(ML + 18, y + 14, 8).fill(INK);
      tx(doc, String(i + 1), ML + 10, y + 9, { bold: true, size: 8, color: WHITE, width: 16, align: 'center' });
      tx(doc, r.title || 'Recommendation', ML + 32, y + 8, { bold: true, size: 9.5, color: INK, width: inner });
      let yy = y + 26;
      if (why) {
        tx(doc, why, ML + 32, yy, { size: 8, color: MUTED, width: inner });
        yy += whyH + 3;
      }
      if (how) {
        tx(doc, `Do this: ${how}`, ML + 32, yy, { size: 8, color: TEXT, width: inner });
        yy += howH + 4;
      }
      let cx = ML + 32;
      const chips = [
        r.impact && `${r.impact} impact`,
        r.effort && `${r.effort} effort`,
        r.service || r.service_key,
      ].filter(Boolean);
      chips.forEach((c) => {
        cx += chip(doc, c, cx, yy, c === (r.service || r.service_key) ? INDIGO : MUTED);
      });
      doc.y = y + boxH + 6;
    });
  }

  const help = report.how_makeflow_helps?.length
    ? report.how_makeflow_helps.filter((g) => (g.items || []).length || g.description)
    : Object.keys(SERVICES)
        .map((key) => ({
          service_key: key,
          name: SERVICES[key].name,
          description: SERVICES[key].description,
          items: recs.filter((r) => (r.service || r.service_key) === key).map((r) => r.title),
        }))
        .filter((g) => g.items?.length);

  if (help.length) {
    heading(doc, 'How MakeFlow can fix this');
    const n = Math.min(help.length, 3);
    const colW = (cw(doc) - 8 * (n - 1)) / n;
    need(doc, 86);
    const y = doc.y;
    help.slice(0, 3).forEach((g, i) => {
      const x = ML + i * (colW + 8);
      doc.roundedRect(x, y, colW, 82, 8).fill(INK);
      tx(doc, g.name || g.title || g.service_key, x + 10, y + 10, { bold: true, size: 8.5, color: WHITE, width: colW - 20 });
      tx(doc, g.description || g.body || '', x + 10, y + 26, { size: 7, color: '#94A3B8', width: colW - 20, height: 22 });
      (g.items || []).slice(0, 2).forEach((item, ii) => {
        tx(doc, `• ${item}`, x + 10, y + 52 + ii * 12, { size: 7, color: '#C7D2FE', width: colW - 20, height: 11, ellipsis: true });
      });
    });
    doc.y = y + 90;
  }

  need(doc, 36);
  doc.roundedRect(ML, doc.y, cw(doc), 32, 7).fill(WHITE);
  tx(
    doc,
    `Methodology: ${metrics.opportunity_count || 0} opportunity questions tested against ChatGPT (browsing + knowledge). AI answers are non-deterministic. Re-run to track change. Not a ranking guarantee.`,
    ML + 12,
    doc.y + 9,
    { size: 7, color: MUTED, width: cw(doc) - 24 }
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
  const meta = { business: t(report.business_name) || 'MakeFlow', date: date || '' };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: MT, bottom: MB, left: ML, right: MR },
      info: {
        Title: `${report.business_name || 'Business'} | AI Visibility Report`,
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
