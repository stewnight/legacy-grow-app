import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Legacy Grow App',
    short_name: 'Grow App',
    description: 'An all-in-one cannabis growing app',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      // Mobile screenshots
      {
        src: '/screenshots/mobile.png',
        sizes: '390x884',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Legacy Grow App Home Screen',
      },
      {
        src: '/screenshots/desktop.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Desktop Dashboard View',
      },
    ],
    categories: ['productivity', 'utilities'],
    prefer_related_applications: false,
  }
}
