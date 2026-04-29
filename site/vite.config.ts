import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Deployed to GitHub Pages at https://shashankswe2020-ux.github.io/shashankswe2020-ux/
// Override with VITE_BASE for local dev or alternate hosts.
const base = process.env.VITE_BASE ?? '/shashankswe2020-ux/';

export default defineConfig({
  base,
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        work: resolve(__dirname, 'work.html'),
        projects: resolve(__dirname, 'projects.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
  server: {
    port: 5173,
  },
});
