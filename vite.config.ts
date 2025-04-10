import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    mode === 'analyze' && visualizer({
      open: true,
      filename: 'bundle-analysis.html',
    }),
  ],
  server: {
    port: 3001,
    open: true,
  },
  preview: {
    port: 3002,
  },
  resolve: {
    alias: {
      '@its/shared-hooks': path.resolve(__dirname, '../../packages/shared-hooks/src'),
      '@its/shared-ui': path.resolve(__dirname, '../../packages/shared-ui/src'),
      '@': path.resolve(__dirname, './src'), // Added base src alias
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          vendor: ['date-fns', 'recharts', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
  optimizeDeps: {
    include: [
      '@its/shared-hooks',
      '@its/shared-ui',
      '@mui/material',
      '@emotion/react',
    ],
  },
}));