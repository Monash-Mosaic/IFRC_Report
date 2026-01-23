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

### Automated Deployment via GitHub Actions

This project includes automated deployment to Infomaniak via GitHub Actions. Deployments are triggered **only** when a git tag matching the pattern `v*.*.*` (e.g., `v1.2.3`) is pushed to the repository, and the tag must be reachable from the `main` branch.

#### Prerequisites

1. **Create a git tag on main branch:**
   ```bash
   git checkout main
   git pull origin main
   git tag v1.0.0  # Use semantic versioning (vX.Y.Z)
   git push origin v1.0.0
   ```

2. **Configure GitHub Secrets:**
   
   Go to your repository settings → Secrets and variables → Actions, and add the following secrets:

   **Required SFTP Secrets:**
   - `SFTP_HOST` - Your Infomaniak SFTP hostname
   - `SFTP_PORT` - SFTP port (default: 22)
   - `SFTP_USER` - SFTP username
   - `SFTP_PASSWORD` - SFTP password (or use `SFTP_SSH_KEY` instead)
   - `SFTP_SSH_KEY` - Private SSH key for SFTP (alternative to password)
   - `SFTP_REMOTE_PATH` - Remote deployment path (default: `~/sites/wdr26.org`)

   **Required SSH Secrets (for post-deployment commands):**
   - `SSH_HOST` - SSH hostname (can be same as `SFTP_HOST`)
   - `SSH_PORT` - SSH port (default: 22, can be same as `SFTP_PORT`)
   - `SSH_USER` - SSH username (can be same as `SFTP_USER`)
   - `SSH_PASSWORD` - SSH password (or use `SSH_KEY` instead)
   - `SSH_KEY` - Private SSH key for SSH (alternative to password, can be same as `SFTP_SSH_KEY`)

   **Note:** If SSH credentials are the same as SFTP, you can omit the `SSH_*` secrets and the workflow will use `SFTP_*` values.

#### Deployment Process

When you push a tag matching `v*.*.*`:

1. **Validation:** The workflow verifies the tag exists on the `main` branch
2. **Build:** Installs dependencies and builds the Next.js application using Node.js 25
3. **Upload:** Deploys files via SFTP to the configured remote path
4. **Post-deploy:** Installs production dependencies on the server

**Important:** After deployment, restart your application via the Infomaniak dashboard or their provided restart mechanism. The workflow does not automatically restart the Node.js process as Infomaniak manages this through their platform.

#### Deployment Exclusions

The following files/directories are excluded from deployment:
- `.git`, `.github` - Version control
- `node_modules` - Dependencies (installed on server)
- `.next/cache` - Build cache
- `tests`, `*.test.js`, `*.test.js.snap` - Test files
- Development config files (`.gitignore`, `.prettierrc`, `eslint.config.mjs`, etc.)
- `scripts` - Development scripts
- `README.md` - Documentation

#### Troubleshooting

- **Tag not found on main:** Ensure the tag is created on a commit that exists in the `main` branch history
- **SFTP connection failed:** Verify your SFTP credentials and hostname in GitHub Secrets
- **Build fails:** Check the GitHub Actions logs for build errors
- **Application not restarting:** Manually restart via Infomaniak dashboard after deployment

## Benchmarking (Load Test)

You can benchmark a deployed host (or localhost) using the built-in `autocannon` script.

```bash
# Deployed host
npm run benchmark -- --url https://your-domain.example --connections 100 --duration 30

# Localhost (in another terminal run: npm run dev OR npm run build && npm run start)
npm run benchmark -- --url http://localhost:3000 --connections 50 --duration 20
```

Notes:
- By default it tests: `/`, `/en`, `/en/reports/wdr25`, `/en/reports/wdr25/chapter-02` (override with `--paths /,/en/wdr25/chapter-02`)
- It does not fail the process on HTTP non-2xx by default (use `--fail-on-non2xx` if desired)
