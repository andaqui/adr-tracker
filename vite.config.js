import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'ui/src'),
  publicDir: path.resolve(__dirname, 'ui/public'),
  build: {
    outDir: path.resolve(__dirname, 'ui/dist'),
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true
  }
});
