import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  appType: 'spa',
  plugins: [react()],
  server: { port: 5174 },
  preview: { port: 5174 },
  resolve: { dedupe: ['react', 'react-dom'] },
});
