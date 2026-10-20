/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // относительные пути: сборка работает из любой папки, в том числе на GitHub Pages
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
