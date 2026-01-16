This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Hero Video Assets

The hero section uses HLS (HTTP Live Streaming) video for network-friendly playback. To generate the required assets:

### Prerequisites

Install `ffmpeg`:
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt-get install ffmpeg`
- **Windows**: Download from [https://www.gyan.dev/ffmpeg/builds/](https://www.gyan.dev/ffmpeg/builds/)

### Generating Assets

1. Ensure your source MP4 video exists at: `public/wdr25/wdr_hero_video.mp4`
2. Run the generation script:
   ```bash
   npm run hero:assets
   ```

This will generate:
- `public/wdr25/hero/poster.webp` - First frame as poster image
- `public/wdr25/hero/fallback-muted.mp4` - Muted MP4 fallback
- `public/wdr25/hero/hls/480p.m3u8` + segments - 480p HLS variant
- `public/wdr25/hero/hls/1080p.m3u8` + segments - 1080p HLS variant
- `public/wdr25/hero/hls/master.m3u8` - ABR master playlist
- `public/wdr25/hero/hls/480p_only.m3u8` - 480p-only playlist for low bandwidth

## Deploy on Infomaniak (Node.js Hosting)

Infomaniak Node.js hosting expects a build step and a Node entry point you can start with a `PORT` set by the platform. Follow the Node.js site creation steps in their guide, then use these settings for the custom method:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm run start`
- **Entry point:** `server.js`
- **Port:** use the `PORT` environment variable (already handled in `server.js`)
- **Node version:** choose a supported Node 18+ runtime

Reference: [Create a Node.js site at Infomaniak](https://www.infomaniak.com/en/support/faq/2537/create-a-nodejs-site-at-infomaniak)
