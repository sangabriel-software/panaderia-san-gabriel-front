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
      // Es lo que hace que los usuarios de la app vieja pasen a esta sin quedarse "atascados".
      registerType: 'autoUpdate',

      // main.jsx ya registra /sw.js manualmente; así no se registra dos veces
      injectRegister: false,

      // includeAssets: ['icon-192x192.png', 'icon-512x512.png', 'vite.svg'],
      includeAssets: ['sg-mark.svg', 'icons/*.png'],

      // El manifest ahora vive en public/manifest.json (con iconos "any" y "maskable" separados).
      // false = el plugin NO genera ni inyecta otro manifest, para que no haya dos manifests en conflicto.
      manifest: false,

      // Manifest anterior, ahora reemplazado por public/manifest.json:
      // manifest: {
      //   name: 'San Gabriel Panadería',
      //   short_name: 'San Gabriel',
      //   description: 'Aplicación de San Gabriel',
      //   theme_color: '#000000',
      //   background_color: '#ffffff',
      //   display: 'standalone',
      //   orientation: 'portrait',
      //   start_url: '/',
      //   icons: [
      //     {
      //       src: '/icon-192x192.png',
      //       sizes: '192x192',
      //       type: 'image/png',
      //       purpose: 'any maskable'
      //     },
      //     {
      //       src: '/icon-512x512.png',
      //       sizes: '512x512',
      //       type: 'image/png',
      //       purpose: 'any maskable'
      //     }
      //   ]
      // },

      workbox: {
        // OJO: no agregues "json" aquí. version.json NO debe quedar en caché,
        // porque la app lo consulta justamente para saber si hay una versión nueva.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff2}'],

        // Borra las cachés de versiones anteriores al activarse el service worker nuevo
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,

        runtimeCaching: [
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

      // Con esto activo, el service worker corre también en `npm run dev` y cachea tus cambios,
      // lo que confunde al desarrollar. Para probar la PWA usa `npm run build && npm run preview`.
      devOptions: {
        // enabled: true // Habilita PWA en desarrollo para probar
        enabled: false
      }
    })
  ]
})