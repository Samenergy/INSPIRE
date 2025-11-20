import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      // Increase file system timeout to prevent timeouts during dependency pre-bundling
      timeout: 300000, // 5 minutes
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    // Force include specific packages to optimize pre-bundling
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'react',
      'react-dom',
      'react-router-dom',
    ],
    // Exclude problematic packages if needed
    // exclude: [],
  },
}); 