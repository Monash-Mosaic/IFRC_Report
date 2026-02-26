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

## Deploy on Cloudflare Workers (OpenNext)

This project is configured to run on Cloudflare Workers via OpenNext.

### Local development

- `npm run dev` for standard Next.js development.
- `npm run preview` to run the Worker locally (builds via OpenNext and launches a local Workers runtime).

### Deploy

- `npm run deploy` to build and deploy to Cloudflare.
- `npm run upload` to upload a version for gradual deployments.

### Workers Builds (recommended CI)

In Cloudflare Workers Builds, set:

- **Build command:** `npx @opennextjs/cloudflare build`
- **Deploy command:** `npx @opennextjs/cloudflare deploy`

### Notes

- The Worker uses the Node.js runtime; do not use `export const runtime = "edge"` in app code.
- Static asset caching is configured in public/_headers.
- Optional: add an R2 binding named `NEXT_INC_CACHE_R2_BUCKET` to enable ISR caching.

## Search Persistence (D1 + FlexSearch)

Search now uses FlexSearch at runtime with index/document persistence in Cloudflare D1.

1. Create/update your D1 databases. The repository keeps placeholder IDs in `wrangler.jsonc`:
   - production binding: `SEARCH_DB`
   - preview binding: `SEARCH_DB` under `env.preview`
2. Inject D1 database IDs before any Wrangler command (CI does this automatically):
   - required env vars:
     - `CF_D1_SEARCH_DB_ID_PROD`
     - `CF_D1_SEARCH_DB_ID_PREVIEW`
   - command:
     - `node scripts/ci/inject-d1-database-ids.mjs`
3. (Optional) Set `NEXT_PUBLIC_GIT_TAG` before `npm run build:search` to persist into a namespaced index:
   - preview example: `NEXT_PUBLIC_GIT_TAG=<preview-branch-slug>`
   - staging example: `NEXT_PUBLIC_GIT_TAG=<release-tag>`
4. Apply schema migration:
   - `npm run build:search`

## CI/CD and DevSecOps (GitHub Actions)

This repository uses GitHub Actions for CI/CD and DevSecOps checks, aligned with Cloudflare Workers deployments.

### Workflows

- CodeQL security scanning: [.github/workflows/codeql.yml](.github/workflows/codeql.yml)
- PR preview deploy: [.github/workflows/deploy-preview.yml](.github/workflows/deploy-preview.yml)
- Production deploy on published releases: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
- Staging deploy on Produciton Preview Url: [.github/workflows/deploy-staging.yml](.github/workflows/deploy-staging.yml)

### Release flow

1. Create a version tag and publish a GitHub Release.
2. Both staging workflows run on published releases.
3. Production deploy requires Manual Deployment Through Github Actions.

### Required GitHub Environments

Create these environments with required reviewers:

- preview
- staging
- production

Add the following secrets to each environment:

- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
- CF_D1_SEARCH_DB_ID_PROD
- CF_D1_SEARCH_DB_ID_PREVIEW

### CI-managed D1 database IDs

Deploy workflows inject D1 `database_id` values into `wrangler.jsonc` at runtime:

- script: `scripts/ci/inject-d1-database-ids.mjs`
- workflows:
  - `.github/workflows/deploy-preview.yml`
  - `.github/workflows/deploy-staging.yml`
  - `.github/workflows/deploy.yml`

The script validates required secrets, replaces placeholders, and fails if placeholders remain.
Any future step that runs `npm run build:search` must run after this injection step in the same job.

### Security gates

Deployments are blocked unless these checks pass:

- Linting
- Unit tests
- Dependency audit

### Notes on Cloudflare accounts

Use separate Cloudflare API tokens per environment to enforce account boundaries.

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
