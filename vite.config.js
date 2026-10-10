import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import versionPlugin from './vite.version.plugin.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Genera dist/version.json y define __APP_VERSION__ en cada build (aviso de "nueva versión")
    versionPlugin(),

    VitePWA({
      // autoUpdate: el service worker nuevo se activa solo (skipWaiting + clientsClaim).
      registerType: 'autoUpdate',

      // main.jsx registra /sw.js manualmente (archivo generado por este plugin); así no se registra dos veces
      injectRegister: false,

      includeAssets: ['sg-mark.svg', 'icons/*.png'],

      // El manifest vive en public/manifest.json.
      // false = el plugin NO genera ni inyecta otro manifest.
      manifest: false,

      workbox: {
        // El HTML NO se precachea: así el service worker nunca sirve un index.html viejo
        // que apunte a chunks que ya no existen tras un deploy.
        // Tampoco agregues "json": version.json no debe quedar en caché.
        globPatterns: ['**/*.{js,css,ico,png,svg,jpg,jpeg,woff2}'],

        // Sin HTML precacheado no hay fallback de navegación automático
        navigateFallback: null,

        // Borra las cachés de versiones anteriores al activarse el service worker nuevo
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,

        runtimeCaching: [
          {
            // Páginas (index.html): siempre red primero; la caché solo sirve si no hay internet
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 10
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },

      // Para probar la PWA usa `npm run build && npm run preview`.
      devOptions: {
        enabled: false
      }
    })
  ]
})