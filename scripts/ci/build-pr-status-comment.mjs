#!/usr/bin/env node
/**
 * Builds the unified PR quality report sticky comment body.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const MARKER = '<!-- pr-quality-report -->';
const reportPath = process.env.JEST_REPORT_PATH || 'report.json';
const baseReportPath = process.env.BASE_REPORT_PATH || '';
const coverageMarkdownPath = process.env.COVERAGE_MARKDOWN_PATH || '';
const outputPath = process.env.OUTPUT_PATH || 'pr-quality-comment.md';

const deployStatus = process.env.DEPLOY_STATUS || 'pending';
const previewUrl = process.env.PREVIEW_URL || '';
const branchPreviewUrl = process.env.BRANCH_PREVIEW_URL || '';
const workerVersionId = process.env.WORKER_VERSION_ID || '';

function testDurationMs(report) {
  if (report.endTime && report.startTime) {
    return report.endTime - report.startTime;
  }

  return (report.testResults ?? []).reduce((suiteTotal, suite) => {
    const suiteDuration = (suite.assertionResults ?? []).reduce(
      (testTotal, test) => testTotal + (test.duration ?? 0),
      0,
    );
    return suiteTotal + suiteDuration;
  }, 0);
}
function formatTestsLine(report) {
  const {
    numPassedTests = 0,
    numFailedTests = 0,
    numPendingTests = 0,
    success = false,
  } = report;
  const durationMs = testDurationMs(report);
  const durationSec = durationMs > 0 ? `${(durationMs / 1000).toFixed(1)}s` : '';

  if (numFailedTests > 0) {
    return `❌ ${numPassedTests} passed, ${numFailedTests} failed${numPendingTests ? `, ${numPendingTests} skipped` : ''}${durationSec ? ` (${durationSec})` : ''}`;
  }
  if (!success) {
    return '❌ Tests did not complete successfully';
  }
  return `✅ ${numPassedTests} passed${numPendingTests ? `, ${numPendingTests} skipped` : ''}${durationSec ? ` (${durationSec})` : ''}`;
}

function coveragePercent(report) {
  const map = report?.coverageMap;
  if (!map) {
    return null;
  }

  let covered = 0;
  let total = 0;

  for (const file of Object.values(map)) {
    if (!file || typeof file !== 'object') {
      continue;
    }

    if (file.s) {
      for (const hits of Object.values(file.s)) {
        total += 1;
        if (hits > 0) {
          covered += 1;
        }
      }
      continue;
    }

    for (const metric of Object.values(file)) {
      if (metric && typeof metric === 'object' && 'total' in metric) {
        total += metric.total ?? 0;
        covered += metric.covered ?? 0;
      }
    }
  }

  if (total === 0) {
    return null;
  }

  return (covered / total) * 100;
}

function formatCoverageLine(headReport, baseReport) {
  const headPct = coveragePercent(headReport);
  if (headPct === null) {
    return '—';
  }

  const headFormatted = headPct.toFixed(1);
  const basePct = baseReport ? coveragePercent(baseReport) : null;
  if (basePct === null) {
    return `${headFormatted}%`;
  }

  const delta = headPct - basePct;
  const sign = delta > 0 ? '+' : '';
  return `${headFormatted}% (${sign}${delta.toFixed(1)}% vs main)`;
}

function formatDeployLine() {
  if (deployStatus === 'success' && previewUrl) {
    return `✅ [Preview](${previewUrl})`;
  }
  if (deployStatus === 'failed') {
    return '❌ Deploy failed';
  }
  if (deployStatus === 'skipped') {
    return '— (not a PR)';
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

let report = {};
let baseReport = null;
try {
  if (reportPath && reportPath !== '/dev/null') {
    report = JSON.parse(readFileSync(reportPath, 'utf8'));
  }
} catch {
  report = {};
}

if (baseReportPath) {
  try {
    baseReport = JSON.parse(readFileSync(baseReportPath, 'utf8'));
  } catch {
    baseReport = null;
  }
}

let coverageDetails = '';
if (coverageMarkdownPath) {
  try {
    coverageDetails = readFileSync(coverageMarkdownPath, 'utf8').trim();
  } catch {
    coverageDetails = '';
  }
}

const testsLine = formatTestsLine(report);
const coverageLine = formatCoverageLine(report, baseReport);
const deployLine = formatDeployLine();
const workerLine = formatWorkerVersion();

let body = `${MARKER}
## PR Quality Report

| Category | Status |
| --- | --- |
| Tests | ${testsLine} |
| Coverage | ${coverageLine} |
| Preview Deployment | ${deployLine} |
| Worker Version | ${workerLine} |
`;

if (branchPreviewUrl && deployStatus === 'success') {
  body += `\n**Branch preview:** ${branchPreviewUrl}\n`;
}

if (coverageDetails) {
  body += `\n<details>\n<summary>Coverage details</summary>\n\n${coverageDetails}\n\n</details>\n`;
}

writeFileSync(outputPath, body);
