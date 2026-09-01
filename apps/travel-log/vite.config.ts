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
      includeAssets: [
        'favicon.svg',
        'favicon-16.png',
        'favicon-32.png',
        'apple-touch-icon.png',
        'apple-touch-icon-152.png',
        'apple-touch-icon-167.png',
        'og-image.png',
        'robots.txt',
      ],
      manifest: {
        name: '간직.log — 친구와 함께 남기는 여행',
        short_name: '간직.log',
        description: '친구를 초대해 함께 갈 곳을 담고, 다녀와서 사진·후기로 오래 남기는 여행 기억장.',
        lang: 'ko',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FAF3EC',
        theme_color: '#984631',
        icons: [
          // 설치(홈 화면/앱) 아이콘 = 스케치 캐릭터. (파비콘=배낭은 브라우저 탭 전용)
          { src: '/icon-maskable.svg', type: 'image/svg+xml', sizes: 'any' },
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
