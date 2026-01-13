#!/usr/bin/env node
/**
 * Hero Video Asset Generation Script
 * 
 * This script generates HLS video assets and poster image from a source MP4 file.
 * 
 * Prerequisites:
 * - ffmpeg must be installed and available in PATH
 *   Install: https://ffmpeg.org/download.html
 *   macOS: brew install ffmpeg
 *   Linux: sudo apt-get install ffmpeg
 *   Windows: Download from https://www.gyan.dev/ffmpeg/builds/
 * 
 * Usage:
 *   npm run hero:assets
 * 
 * Input:
 *   public/wdr25/wdr_hero_video.mp4
 * 
 * Output:
 *   public/wdr25/hero/poster.jpg
 *   public/wdr25/hero/fallback-muted.mp4
 *   public/wdr25/hero/hls/240p.m3u8 + segments
 *   public/wdr25/hero/hls/360p.m3u8 + segments
 *   public/wdr25/hero/hls/480p.m3u8 + segments
 *   public/wdr25/hero/hls/720p.m3u8 + segments
 *   public/wdr25/hero/hls/1080p.m3u8 + segments
 *   public/wdr25/hero/hls/master.m3u8
 *   public/wdr25/hero/hls/2g.m3u8
 *   public/wdr25/hero/hls/3g.m3u8
 *   public/wdr25/hero/hls/low4g.m3u8
 *   public/wdr25/hero/hls/4g.m3u8
 *   public/wdr25/hero/hls/save_data.m3u8
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

const SOURCE_VIDEO = join(projectRoot, 'public/wdr25/wdr_hero_video.mp4');
const OUTPUT_DIR = join(projectRoot, 'public/wdr25/hero');
const HLS_DIR = join(OUTPUT_DIR, 'hls');
const HLS_240P_DIR = join(HLS_DIR, '240p');
const HLS_360P_DIR = join(HLS_DIR, '360p');
const HLS_480P_DIR = join(HLS_DIR, '480p');
const HLS_720P_DIR = join(HLS_DIR, '720p');
const HLS_1080P_DIR = join(HLS_DIR, '1080p');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`, 'blue');
  }
}

function runFFmpeg(command, description) {
  log(`\n${description}...`, 'yellow');
  try {
    execSync(command, { stdio: 'inherit', cwd: projectRoot });
    log(`✓ ${description} completed`, 'green');
  } catch (error) {
    log(`✗ ${description} failed: ${error.message}`, 'red');
    throw error;
  }
}

function createMasterPlaylist() {
  const masterPlaylistPath = join(HLS_DIR, 'master.m3u8');
  const masterContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=350000,RESOLUTION=426x240,CODECS="avc1.42e01e"
240p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=750000,RESOLUTION=640x360,CODECS="avc1.42e01e"
360p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=854x480,CODECS="avc1.4d001f"
480p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720,CODECS="avc1.4d001f"
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5250000,RESOLUTION=1920x1080,CODECS="avc1.640028"
1080p.m3u8
`;

  writeFileSync(masterPlaylistPath, masterContent);
  log(`✓ Created master.m3u8`, 'green');
}

function create2GPlaylist() {
  const playlistPath = join(HLS_DIR, '2g.m3u8');
  const content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=350000,RESOLUTION=426x240,CODECS="avc1.42e01e"
240p.m3u8
`;

  writeFileSync(playlistPath, content);
  log(`✓ Created 2g.m3u8`, 'green');
}

function create3GPlaylist() {
  const playlistPath = join(HLS_DIR, '3g.m3u8');
  const content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=350000,RESOLUTION=426x240,CODECS="avc1.42e01e"
240p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=750000,RESOLUTION=640x360,CODECS="avc1.42e01e"
360p.m3u8
`;

  writeFileSync(playlistPath, content);
  log(`✓ Created 3g.m3u8`, 'green');
}

function createLow4GPlaylist() {
  const playlistPath = join(HLS_DIR, 'low4g.m3u8');
  const content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=750000,RESOLUTION=640x360,CODECS="avc1.42e01e"
360p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=854x480,CODECS="avc1.4d001f"
480p.m3u8
`;

  writeFileSync(playlistPath, content);
  log(`✓ Created low4g.m3u8`, 'green');
}

function create4GPlaylist() {
  const playlistPath = join(HLS_DIR, '4g.m3u8');
  const content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=854x480,CODECS="avc1.4d001f"
480p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720,CODECS="avc1.4d001f"
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5250000,RESOLUTION=1920x1080,CODECS="avc1.640028"
1080p.m3u8
`;

  writeFileSync(playlistPath, content);
  log(`✓ Created 4g.m3u8`, 'green');
}

function createSaveDataPlaylist() {
  const playlistPath = join(HLS_DIR, 'save_data.m3u8');
  const content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=350000,RESOLUTION=426x240,CODECS="avc1.42e01e"
240p.m3u8
`;

  writeFileSync(playlistPath, content);
  log(`✓ Created save_data.m3u8`, 'green');
}

async function main() {
  log('\n=== Hero Video Asset Generation ===\n', 'blue');

  // Check prerequisites
  if (!checkFFmpeg()) {
    log('✗ Error: ffmpeg is not installed or not in PATH', 'red');
    log('Please install ffmpeg:', 'yellow');
    log('  macOS: brew install ffmpeg', 'yellow');
    log('  Linux: sudo apt-get install ffmpeg', 'yellow');
    log('  Windows: Download from https://www.gyan.dev/ffmpeg/builds/', 'yellow');
    process.exit(1);
  }

  if (!existsSync(SOURCE_VIDEO)) {
    log(`✗ Error: Source video not found at ${SOURCE_VIDEO}`, 'red');
    log('Please ensure the source MP4 file exists at: public/wdr25/wdr_hero_video.mp4', 'yellow');
    process.exit(1);
  }

  // Create output directories
  ensureDir(OUTPUT_DIR);
  ensureDir(HLS_DIR);
  ensureDir(HLS_240P_DIR);
  ensureDir(HLS_360P_DIR);
  ensureDir(HLS_480P_DIR);
  ensureDir(HLS_720P_DIR);
  ensureDir(HLS_1080P_DIR);

  log(`\nSource: ${SOURCE_VIDEO}`, 'blue');
  log(`Output: ${OUTPUT_DIR}\n`, 'blue');

  try {
    // 1. Extract first frame as poster
    runFFmpeg(
      `ffmpeg -y -i "${SOURCE_VIDEO}" -vf "select=eq(n\\,0)" -frames:v 1 -update 1 -q:v 2 "${join(OUTPUT_DIR, 'poster.jpg')}"`,
      'Extracting poster image (first frame)'
    );

    // 2. Create muted MP4 fallback
    runFFmpeg(
      `ffmpeg -y -i "${SOURCE_VIDEO}" -c:v copy -an "${join(OUTPUT_DIR, 'fallback-muted.mp4')}"`,
      'Creating muted MP4 fallback'
    );

    // 3. Generate 240p HLS variant (ultra-low bandwidth: 0.25-0.45 Mbps)
    // 426x240 for 16:9 aspect ratio, reduced to 15fps for lower bandwidth
    runFFmpeg(
      `ffmpeg -y -i "${SOURCE_VIDEO}" -an -vf "scale=w=426:h=240:force_original_aspect_ratio=decrease,pad=w=426:h=240:x=(ow-iw)/2:y=(oh-ih)/2:color=black,fps=15" -c:v libx264 -profile:v baseline -preset veryfast -b:v 350k -maxrate 450k -bufsize 675k -g 30 -keyint_min 30 -sc_threshold 0 -r 15 -hls_time 2 -hls_list_size 0 -hls_playlist_type vod -hls_segment_filename "${HLS_240P_DIR}/seg_%05d.ts" -hls_base_url "240p/" "${join(HLS_DIR, '240p.m3u8')}"`,
      'Generating 240p HLS variant (ultra-low bandwidth, 15fps)'
    );

    // 4. Generate 360p HLS variant (low bandwidth: 0.6-0.9 Mbps)
    // 640x360 for 16:9 aspect ratio
    runFFmpeg(
      `ffmpeg -y -i "${SOURCE_VIDEO}" -an -vf "scale=w=640:h=360:force_original_aspect_ratio=decrease,pad=w=640:h=360:x=(ow-iw)/2:y=(oh-ih)/2:color=black" -c:v libx264 -profile:v baseline -preset veryfast -b:v 750k -maxrate 900k -bufsize 1350k -g 48 -keyint_min 48 -sc_threshold 0 -hls_time 2 -hls_list_size 0 -hls_playlist_type vod -hls_segment_filename "${HLS_360P_DIR}/seg_%05d.ts" -hls_base_url "360p/" "${join(HLS_DIR, '360p.m3u8')}"`,
      'Generating 360p HLS variant (low bandwidth)'
    );

    // 5. Generate 480p HLS variant (medium-low bandwidth: 1.0-1.4 Mbps)
    // 854x480 for 16:9 aspect ratio
    runFFmpeg(
      `ffmpeg -y -i "${SOURCE_VIDEO}" -an -vf "scale=w=854:h=480:force_original_aspect_ratio=decrease,pad=w=854:h=480:x=(ow-iw)/2:y=(oh-ih)/2:color=black" -c:v libx264 -profile:v main -preset veryfast -b:v 1200k -maxrate 1400k -bufsize 2100k -g 48 -keyint_min 48 -sc_threshold 0 -hls_time 2 -hls_list_size 0 -hls_playlist_type vod -hls_segment_filename "${HLS_480P_DIR}/seg_%05d.ts" -hls_base_url "480p/" "${join(HLS_DIR, '480p.m3u8')}"`,
      'Generating 480p HLS variant (medium-low bandwidth)'
    );

    // 6. Generate 720p HLS variant (medium-high bandwidth: 2.5-3.5 Mbps)
    // 1280x720 for 16:9 aspect ratio
    runFFmpeg(
      `ffmpeg -y -i "${SOURCE_VIDEO}" -an -vf "scale=w=1280:h=720:force_original_aspect_ratio=decrease,pad=w=1280:h=720:x=(ow-iw)/2:y=(oh-ih)/2:color=black" -c:v libx264 -profile:v main -preset veryfast -b:v 3000k -maxrate 3500k -bufsize 5250k -g 48 -keyint_min 48 -sc_threshold 0 -hls_time 2 -hls_list_size 0 -hls_playlist_type vod -hls_segment_filename "${HLS_720P_DIR}/seg_%05d.ts" -hls_base_url "720p/" "${join(HLS_DIR, '720p.m3u8')}"`,
      'Generating 720p HLS variant (medium-high bandwidth)'
    );

    // 7. Generate 1080p30 HLS variant (high bandwidth: 4.5-6.0 Mbps)
    // 1920x1080 for 16:9 aspect ratio
    runFFmpeg(
      `ffmpeg -y -i "${SOURCE_VIDEO}" -an -vf "scale=w=1920:h=1080:force_original_aspect_ratio=decrease,pad=w=1920:h=1080:x=(ow-iw)/2:y=(oh-ih)/2:color=black" -c:v libx264 -profile:v high -preset veryfast -b:v 5250k -maxrate 6000k -bufsize 9000k -g 60 -keyint_min 60 -sc_threshold 0 -r 30 -hls_time 2 -hls_list_size 0 -hls_playlist_type vod -hls_segment_filename "${HLS_1080P_DIR}/seg_%05d.ts" -hls_base_url "1080p/" "${join(HLS_DIR, '1080p.m3u8')}"`,
      'Generating 1080p30 HLS variant (high bandwidth)'
    );

    // 8. Create master and network-specific playlists
    log('\nCreating master and network-specific playlists...', 'yellow');
    createMasterPlaylist();
    create2GPlaylist();
    create3GPlaylist();
    createLow4GPlaylist();
    create4GPlaylist();
    createSaveDataPlaylist();

    log('\n=== Asset Generation Complete ===\n', 'green');
    log(`All assets have been generated in: ${OUTPUT_DIR}`, 'blue');
    log('\nGenerated files:', 'blue');
    log('  - poster.jpg', 'blue');
    log('  - fallback-muted.mp4', 'blue');
    log('  - hls/240p.m3u8 + segments', 'blue');
    log('  - hls/360p.m3u8 + segments', 'blue');
    log('  - hls/480p.m3u8 + segments', 'blue');
    log('  - hls/720p.m3u8 + segments', 'blue');
    log('  - hls/1080p.m3u8 + segments', 'blue');
    log('  - hls/master.m3u8', 'blue');
    log('  - hls/2g.m3u8', 'blue');
    log('  - hls/3g.m3u8', 'blue');
    log('  - hls/low4g.m3u8', 'blue');
    log('  - hls/4g.m3u8', 'blue');
    log('  - hls/save_data.m3u8', 'blue');
  } catch (error) {
    log(`\n✗ Generation failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
