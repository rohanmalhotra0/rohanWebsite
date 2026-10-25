import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The hero name and body copy are the first things painted. Preload their
// Latin font files so text doesn't wait for CSS discovery.
const PRELOAD_FONTS = /assets\/(hubot-(display|heading)-latin|mona-sans-latin-wght-normal)-[\w-]+\.woff2$/;

function preloadFonts() {
  return {
    name: 'preload-fonts',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const tags = Object.keys(ctx.bundle)
          .filter((file) => PRELOAD_FONTS.test(file))
          .map((file) => ({
            tag: 'link',
            attrs: {
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              href: `./${file}`,
              crossorigin: '',
            },
            injectTo: 'head',
          }));
        return { html, tags };
      },
    },
  };
}

export default defineConfig({
  base: './',
  define: {
    'import.meta.env.VITE_BUILD_YEAR': JSON.stringify(String(new Date().getFullYear())),
  },
  plugins: [tailwindcss(), react(), preloadFonts()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Vendor chunks cache across deploys; the app chunk changes often.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
          if (/[\\/]node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion';
          return undefined;
        },
      },
    },
  },
});
