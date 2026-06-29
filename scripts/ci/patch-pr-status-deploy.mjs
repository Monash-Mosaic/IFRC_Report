#!/usr/bin/env node
/**
 * Updates deployment fields in an existing PR quality report comment.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const inputPath = process.env.INPUT_PATH || 'pr-quality-comment.md';
const outputPath = process.env.OUTPUT_PATH || inputPath;
const deployStatus = process.env.DEPLOY_STATUS || 'pending';
const previewUrl = process.env.PREVIEW_URL || '';
const branchPreviewUrl = process.env.BRANCH_PREVIEW_URL || '';
const workerVersionId = process.env.WORKER_VERSION_ID || '';

function formatDeployLine() {
  const url = branchPreviewUrl || previewUrl;
  if (deployStatus === 'success' && url) {
    return `✅ [${url}](${url})`;
  }
  if (deployStatus === 'failed') {
    return '❌ Deploy failed';
  }
  return '⏳ Deploying…';
}

function formatWorkerVersion() {
  if (workerVersionId) {
    return `\`${workerVersionId}\``;
  }
  if (deployStatus === 'pending') {
    return '_pending deploy_';
  }
  return '—';
}

let body = readFileSync(inputPath, 'utf8');
const deployLine = formatDeployLine();
const workerLine = formatWorkerVersion();

body = body.replace(/\| Preview Deployment \| [^|]+ \|/, `| Preview Deployment | ${deployLine} |`);
body = body.replace(/\| Worker Version \| [^|]+ \|/, `| Worker Version | ${workerLine} |`);
body = body.replace(/\n\*\*Branch preview:\*\* .+\n?/g, '\n');

writeFileSync(outputPath, body);
