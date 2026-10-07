import { defineConfig } from 'vite';

// Served from the custom domain https://shashankmishra.bio/ (GitHub Pages).
// Override with VITE_BASE when hosting under a sub-path.
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
});
