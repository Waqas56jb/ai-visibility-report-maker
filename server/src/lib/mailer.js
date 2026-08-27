import nodemailer from 'nodemailer';
import { mapReport } from './map.js';
import { buildPdfBuffer, pdfFilename } from './renderPdf.js';

let transport = undefined;
let warned = false;

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function smtpPass() {
  return String(process.env.SMTP_PASS || '').replace(/[\s-]/g, '');
}

function getTransport() {
  if (transport !== undefined) return transport;
  if (!smtpConfigured()) {
    if (!warned) {
      warned = true;
      console.warn('[mailer] SMTP is not configured; completed-report emails will be skipped.');
    }
    transport = null;
    return null;
  }
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: smtpPass(),
    },
  });
  return transport;
}

function clientOrigin() {
  return String(process.env.CLIENT_ORIGIN || 'https://ai-visibility-report-maker-client.vercel.app').replace(/\/$/, '');
}

function fromAddress() {
  return process.env.SMTP_FROM || process.env.SMTP_USER;
}

function scoreLabel(score) {
  const n = Number(score);
  return Number.isFinite(n) ? String(n) : '—';
}

function htmlBody({ business, score, band, appUrl, publicUrl }) {
  const safeBiz = String(business || 'your business').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  const safeBand = String(band || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#0F172A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E8ECF4;">
          <tr>
            <td style="background:#0B1020;padding:22px 28px;color:#fff;">
              <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#94A3B8;">MakeFlow</div>
              <div style="font-size:20px;font-weight:700;margin-top:6px;">Your AI visibility report is ready</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                We finished the ChatGPT visibility check for <strong>${safeBiz}</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
                <tr>
                  <td style="background:#EEF2FF;border-radius:12px;padding:16px 20px;">
                    <div style="font-size:12px;color:#64748B;text-transform:uppercase;letter-spacing:.08em;">Overall score</div>
                    <div style="font-size:32px;font-weight:800;color:#4F46E5;line-height:1.2;">${scoreLabel(score)}<span style="font-size:16px;font-weight:600;color:#64748B;"> / 100</span></div>
                    ${safeBand ? `<div style="font-size:13px;color:#334155;margin-top:4px;">${safeBand}</div>` : ''}
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#334155;">
                The branded PDF is attached. You can also open the interactive report in your browser.
              </p>
              <a href="${appUrl}" style="display:inline-block;background:#4F46E5;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 18px;border-radius:10px;">Open my report</a>
              <p style="margin:18px 0 0;font-size:12px;color:#64748B;line-height:1.5;">
                Public share link: <a href="${publicUrl}" style="color:#4F46E5;">${publicUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;font-size:12px;color:#94A3B8;border-top:1px solid #E8ECF4;">
              One free report per email every 30 days. This snapshot is tested against ChatGPT and can change over time.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendCompletedReportEmail(row) {
  const to = String(row?.notify_to || '').trim().toLowerCase();
  if (!to) {
    console.warn('[mailer] skip: report has no notify_to', row?.id);
    return { skipped: true };
  }
  const tx = getTransport();
  if (!tx) return { skipped: true };

  const mapped = mapReport(row);
  let pdfBuffer = null;
  try {
    pdfBuffer = await buildPdfBuffer(mapped);
  } catch (err) {
    console.warn('[mailer] PDF attach failed', err.message);
  }

  const origin = clientOrigin();
  const appUrl = `${origin}/app/reports/${row.id}`;
  const publicUrl = `${origin}/report/${row.id}`;
  const business = row.business_name || 'your business';
  const filename = pdfFilename(row);

  await tx.sendMail({
    from: fromAddress(),
    to,
    subject: `${business}: AI visibility score ${scoreLabel(row.overall_score)}/100`,
    text: [
      `Your MakeFlow AI visibility report for ${business} is ready.`,
      '',
      `Score: ${scoreLabel(row.overall_score)}/100${row.score_band ? ` (${row.score_band})` : ''}`,
      '',
      `View: ${appUrl}`,
      `Share: ${publicUrl}`,
      pdfBuffer ? 'The PDF is attached to this email.' : '',
    ]
      .filter(Boolean)
      .join('\n'),
    html: htmlBody({
      business,
      score: row.overall_score,
      band: row.score_band,
      appUrl,
      publicUrl,
    }),
    attachments: pdfBuffer
      ? [{ filename, content: pdfBuffer, contentType: 'application/pdf' }]
      : [],
  });
  return { sent: true, to };
}
