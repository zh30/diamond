import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/cli/index.ts'),
      name: 'diamond',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'commander',
        'front-matter',
        'glob',
        'marked',
        'fs',
        'path',
        'url',
        /^node:.*$/,
      ],
      output: {
        preserveModules: false,
        format: 'es',
        banner: () => '#!/usr/bin/env node',
        inlineDynamicImports: true,
      },
    },
    target: 'node22',
    sourcemap: false,
    assetsInlineLimit: Infinity,
    cssCodeSplit: false,
    cssMinify: true,
    emptyOutDir: true,
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}); 