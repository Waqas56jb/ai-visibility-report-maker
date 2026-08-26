import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import { supabase } from './supabase.js';
import { mapReport } from './lib/map.js';
import { resumeInFlight } from './lib/pipeline.js';
import { loadAdminSettings } from './config/runtime.js';
import { buildPdfBuffer, pdfFilename, sendPdf } from './lib/renderPdf.js';
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import businessRoutes from './routes/businesses.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';

const app = express();
const origins = [process.env.CLIENT_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean);

app.use(cors({ origin: origins.length ? origins : true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

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
  res.status(500).json({ error: err.message || 'Server error' });
});

const port = Number(process.env.PORT) || 4000;
loadAdminSettings()
  .catch((err) => console.warn('admin settings', err.message))
  .finally(() => {
    app.listen(port, () => {
      console.log(`MakeFlow API on http://localhost:${port}`);
      resumeInFlight();
    });
  });
