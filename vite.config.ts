import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/typing-speed-test/", // Ensures correct paths on GitHub Pages
  plugins: [react()]
})