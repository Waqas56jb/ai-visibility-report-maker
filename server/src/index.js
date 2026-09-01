import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import { supabase } from './supabase.js';
import { mapReport } from './lib/map.js';
import { resumeInFlight } from './lib/pipeline.js';
import { loadAdminSettings, publicSitePayload } from './config/runtime.js';
import { ensureAdminColumns } from './db/ensure.js';
import { buildPdfBuffer, pdfFilename, sendPdf } from './lib/renderPdf.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import businessRoutes from './routes/businesses.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.set('trust proxy', 1);
const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ai-visibility-report-maker-client.vercel.app',
  'https://ai-visibility-report-maker-admin.vercel.app',
  'https://www.makeflow.com.au',
  'https://makeflow.com.au',
  'https://admin.makeflow.com.au',
];
const origins = [
  ...DEFAULT_ORIGINS,
  ...(process.env.CLIENT_ORIGIN || '').split(','),
  ...(process.env.ADMIN_ORIGIN || '').split(','),
]
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (origins.includes(origin) || /\.vercel\.app$/.test(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use('/api', apiRateLimit);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/public/site', async (_req, res, next) => {
  try {
    const site = await publicSitePayload();
    res.set('Cache-Control', 'public, max-age=15');
    res.json(site);
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/public/reports/:id/pdf', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_public', true)
      .eq('status', 'completed')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Report not found.' });
    const buffer = await buildPdfBuffer(mapReport(data));
    sendPdf(res, buffer, pdfFilename(data));
  } catch (err) {
    next(err);
  }
});

app.get('/api/public/reports/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_public', true)
      .eq('status', 'completed')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Report not found.' });
    res.json(mapReport(data));
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = Number(err.status) >= 400 && Number(err.status) < 600 ? Number(err.status) : 500;
  if (err.retryAfterSec) res.set('Retry-After', String(err.retryAfterSec));
  res.status(status).json({ error: err.message || 'Server error' });
});

const port = Number(process.env.PORT) || 4000;
const onVercel = Boolean(process.env.VERCEL);

ensureAdminColumns()
  .then(() => loadAdminSettings())
  .catch((err) => console.warn('admin settings', err.message))
  .finally(() => {
    if (onVercel) {
      resumeInFlight();
      return;
    }
    app.listen(port, () => {
      console.log(`MakeFlow API on http://localhost:${port}`);
      resumeInFlight();
    });
  });

export default app;
