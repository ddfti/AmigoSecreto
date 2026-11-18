import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
      {
        name: 'wishlist-dev-persistence',
        apply: 'serve',
        configureServer(server) {
          const wishlistPath = path.resolve(__dirname, 'src/data/wishlist.json');
          server.middlewares.use('/__api/wishlist', (req, res) => {
            if (req.method === 'GET') {
              try {
                const raw = fs.readFileSync(wishlistPath, 'utf-8');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(raw);
              } catch {
                res.statusCode = 500;
                res.end(JSON.stringify({error: 'Falha ao ler wishlist.json'}));
              }
              return;
            }

            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const parsed = JSON.parse(body);
                  if (!parsed || !parsed.config || !Array.isArray(parsed.items)) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({error: 'Formato inválido'}));
                    return;
                  }
                  fs.writeFileSync(
                    wishlistPath,
                    JSON.stringify(parsed, null, 2) + '\n',
                    'utf-8',
                  );
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({ok: true}));
                } catch {
                  res.statusCode = 500;
                  res.end(JSON.stringify({error: 'Falha ao salvar wishlist.json'}));
                }
              });
              return;
            }

            res.statusCode = 405;
            res.end();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
