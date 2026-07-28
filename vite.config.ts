import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // GitHub Pages(프로젝트 사이트)와 Vercel(루트) 모두 지원
  base: process.env.GITHUB_PAGES === 'true' ? '/glumemo/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'GluMemo 혈당 일기',
        short_name: 'GluMemo',
        description: '혼자 쓰는 혈당·식사 기록 앱',
        theme_color: '#115e59',
        background_color: '#e8efec',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ko',
        start_url: './',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
