import type { MetadataRoute } from 'next';

// The web app manifest: the name and the icons that phones and browsers use when the site is saved to the home screen.
// (The icon files are src/app/icon.svg and src/app/apple-icon.png.)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'YourHEI',
    short_name: 'YourHEI',
    start_url: '/',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
