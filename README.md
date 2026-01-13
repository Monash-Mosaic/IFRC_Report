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

The hero section uses native HTML video with MP4 files for network-friendly playback. The component automatically selects the appropriate video quality based on the user's network conditions.

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
- `public/wdr25/hero/poster.jpg` - First frame as poster image
- `public/wdr25/hero/mp4/240p.mp4` - Ultra-low bandwidth (426x240, 15fps, ~350kbps)
- `public/wdr25/hero/mp4/360p.mp4` - Low bandwidth (640x360, 30fps, ~750kbps)
- `public/wdr25/hero/mp4/480p.mp4` - Medium-low bandwidth (854x480, 30fps, ~1200kbps)
- `public/wdr25/hero/mp4/720p.mp4` - Medium-high bandwidth (1280x720, 30fps, ~3000kbps)
- `public/wdr25/hero/mp4/1080p.mp4` - High bandwidth (1920x1080, 30fps, ~5250kbps)

### Network-Based Video Selection

The component automatically selects video quality based on network conditions:

- **Data Saver Mode** → 240p.mp4
- **2G / slow-2G** → 240p.mp4
- **3G** → 360p.mp4
- **4G (low bandwidth < 1.5 Mbps)** → 480p.mp4
- **4G (high bandwidth ≥ 1.5 Mbps)** → 1080p.mp4
- **Default / Unknown** → 720p.mp4 (balanced quality)
