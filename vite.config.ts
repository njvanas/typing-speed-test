import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/typing-speed-test/', // Correct path for GitHub Pages subpath
  plugins: [react()],
  build: {
    outDir: 'dist',  // Output directory for production build
  },
});
