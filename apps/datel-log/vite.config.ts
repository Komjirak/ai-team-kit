import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Datel.log — 우리가 함께 걸은 곳',
        short_name: 'Datel.log',
        description: '함께 갈 곳을 담고, 다녀온 곳으로 넘기고, 그 궤적을 지도와 숫자로 돌아보는 커플 다이어리.',
        lang: 'ko',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FAF3EC',
        theme_color: '#984631',
        icons: [
          { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
          { src: '/icon-192.png', type: 'image/png', sizes: '192x192', purpose: 'any maskable' },
          { src: '/icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        // 지도·검색·인증은 온라인 전제 — 외부 요청은 캐시하지 않는다.
        navigateFallbackDenylist: [/^\/__/, /kakao/, /firebase/, /googleapis/],
      },
    }),
  ],
  server: { port: 5173, host: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
        },
      },
    },
  },
})
