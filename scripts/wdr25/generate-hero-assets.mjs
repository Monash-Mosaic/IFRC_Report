#!/usr/bin/env node
/**
 * Hero Video Asset Generation Script
 * 
 * This script generates MP4 video variants and poster image from a source MP4 file.
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
 *   public/wdr25/hero/mp4/240p.mp4
 *   public/wdr25/hero/mp4/360p.mp4
 *   public/wdr25/hero/mp4/480p.mp4
 *   public/wdr25/hero/mp4/720p.mp4
 *   public/wdr25/hero/mp4/1080p.mp4
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

const SOURCE_VIDEO = join(projectRoot, 'public/wdr25/wdr_hero_video.mp4');
const OUTPUT_DIR = join(projectRoot, 'public/wdr25/hero');
const MP4_DIR = join(OUTPUT_DIR, 'mp4');

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
  ensureDir(MP4_DIR);

  log(`\nSource: ${SOURCE_VIDEO}`, 'blue');
  log(`Output: ${OUTPUT_DIR}\n`, 'blue');

  try {
    // 1. Extract first frame as poster
    runFFmpeg(
      `ffmpeg -y -i "${SOURCE_VIDEO}" -vf "select=eq(n\\,0)" -frames:v 1 -update 1 -q:v 2 "${join(OUTPUT_DIR, 'poster.jpg')}"`,
      'Extracting poster image (first frame)'
    );

    // 2. Generate 240p MP4 variant (ultra-low bandwidth: 0.25-0.45 Mbps)
    // 426x240 for 16:9 aspect ratio, reduced to 15fps for lower bandwidth
    runFFmpeg(
      `ffmpeg -y -i "${SOURCE_VIDEO}" -an -vf "scale=w=426:h=240:force_original_aspect_ratio=decrease,pad=w=426:h=240:x=(ow-iw)/2:y=(oh-ih)/2:color=black,fps=15" -c:v libx264 -profile:v baseline -preset veryfast -b:v 350k -maxrate 450k -bufsize 675k -g 30 -keyint_min 30 -sc_threshold 0 -r 15 -movflags +faststart "${join(MP4_DIR, '240p.mp4')}"`,
      'Generating 240p MP4 variant (ultra-low bandwidth, 15fps)'
    );

    // 3. Generate 360p MP4 variant (low bandwidth: 0.6-0.9 Mbps)
    // 640x360 for 16:9 aspect ratio
    runFFmpeg(
      `ffmpeg -y -i "${SOURCE_VIDEO}" -an -vf "scale=w=640:h=360:force_original_aspect_ratio=decrease,pad=w=640:h=360:x=(ow-iw)/2:y=(oh-ih)/2:color=black" -c:v libx264 -profile:v baseline -preset veryfast -b:v 750k -maxrate 900k -bufsize 1350k -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "${join(MP4_DIR, '360p.mp4')}"`,
      'Generating 360p MP4 variant (low bandwidth)'
    );

    // 4. Generate 480p MP4 variant (medium-low bandwidth: 1.0-1.4 Mbps)
    // 854x480 for 16:9 aspect ratio
    runFFmpeg(
      `ffmpeg -y -i "${SOURCE_VIDEO}" -an -vf "scale=w=854:h=480:force_original_aspect_ratio=decrease,pad=w=854:h=480:x=(ow-iw)/2:y=(oh-ih)/2:color=black" -c:v libx264 -profile:v main -preset veryfast -b:v 1200k -maxrate 1400k -bufsize 2100k -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "${join(MP4_DIR, '480p.mp4')}"`,
      'Generating 480p MP4 variant (medium-low bandwidth)'
    );

    // 5. Generate 720p MP4 variant (medium-high bandwidth: 2.5-3.5 Mbps)
    // 1280x720 for 16:9 aspect ratio
    runFFmpeg(
      `ffmpeg -y -i "${SOURCE_VIDEO}" -an -vf "scale=w=1280:h=720:force_original_aspect_ratio=decrease,pad=w=1280:h=720:x=(ow-iw)/2:y=(oh-ih)/2:color=black" -c:v libx264 -profile:v main -preset veryfast -b:v 3000k -maxrate 3500k -bufsize 5250k -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "${join(MP4_DIR, '720p.mp4')}"`,
      'Generating 720p MP4 variant (medium-high bandwidth)'
    );

    // 6. Generate 1080p MP4 variant (high bandwidth: 4.5-6.0 Mbps)
    // 1920x1080 for 16:9 aspect ratio
    runFFmpeg(
      `ffmpeg -y -i "${SOURCE_VIDEO}" -an -vf "scale=w=1920:h=1080:force_original_aspect_ratio=decrease,pad=w=1920:h=1080:x=(ow-iw)/2:y=(oh-ih)/2:color=black" -c:v libx264 -profile:v high -preset veryfast -b:v 5250k -maxrate 6000k -bufsize 9000k -g 60 -keyint_min 60 -sc_threshold 0 -r 30 -movflags +faststart "${join(MP4_DIR, '1080p.mp4')}"`,
      'Generating 1080p MP4 variant (high bandwidth)'
    );

    log('\n=== Asset Generation Complete ===\n', 'green');
    log(`All assets have been generated in: ${OUTPUT_DIR}`, 'blue');
    log('\nGenerated files:', 'blue');
    log('  - poster.jpg', 'blue');
    log('  - mp4/240p.mp4', 'blue');
    log('  - mp4/360p.mp4', 'blue');
    log('  - mp4/480p.mp4', 'blue');
    log('  - mp4/720p.mp4', 'blue');
    log('  - mp4/1080p.mp4', 'blue');
  } catch (error) {
    log(`\n✗ Generation failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
