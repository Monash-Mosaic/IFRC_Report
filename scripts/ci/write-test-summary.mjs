#!/usr/bin/env node
/**
 * Writes Jest test statistics to GITHUB_STEP_SUMMARY from Jest JSON output.
 */
import { readFileSync, appendFileSync } from 'node:fs';

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

const reportPath = process.argv[2] || 'report.json';
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

if (!summaryPath) {
  process.exit(0);
}

let report;
try {
  report = JSON.parse(readFileSync(reportPath, 'utf8'));
} catch {
  appendFileSync(summaryPath, '## Test results\n\n_Test report could not be parsed._\n');
  process.exit(0);
}

const {
  numTotalTests = 0,
  numPassedTests = 0,
  numFailedTests = 0,
  numPendingTests = 0,
  success = false,
  startTime = 0,
} = report;

const durationMs = testDurationMs(report);
const durationSec = durationMs > 0 ? (durationMs / 1000).toFixed(1) : '—';
const statusIcon = success ? '✅' : '❌';

const failedTests = (report.testResults ?? [])
  .flatMap((suite) =>
    (suite.assertionResults ?? [])
      .filter((t) => t.status === 'failed')
      .map((t) => `- \`${t.fullName}\``),
  )
  .slice(0, 20);

let body = `## Test results ${statusIcon}

| Metric | Count |
| --- | ---: |
| Total | ${numTotalTests} |
| Passed | ${numPassedTests} |
| Failed | ${numFailedTests} |
| Skipped | ${numPendingTests} |
| Duration | ${durationSec}s |
`;

if (failedTests.length > 0) {
  body += `\n### Failed tests\n\n${failedTests.join('\n')}\n`;
  if (numFailedTests > failedTests.length) {
    body += `\n_…and ${numFailedTests - failedTests.length} more. See the Checks tab for details._\n`;
  }
}

appendFileSync(summaryPath, body);
