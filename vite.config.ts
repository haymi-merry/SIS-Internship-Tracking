import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
  },
  resolve: {
    alias: {
      '@its/shared-hooks': path.resolve(__dirname, '../../packages/shared-hooks/src'),
      '@its/shared-ui': path.resolve(__dirname, '../../packages/shared-ui/src'),
    },
  },
});