# GitHub Actions — CI Architecture

This repository uses a thin orchestration workflow (`ci.yml`) that delegates work to reusable workflows and composite actions.

## Folder structure

```
.github/
├── README.md                          # This document
├── actions/
│   ├── setup-node-environment/        # Checkout + Node.js + npm cache
│   ├── install-dependencies/          # node_modules cache + npm ci
│   ├── restore-next-cache/            # .next/cache restore
│   ├── restore-jest-cache/            # Jest transform cache restore
│   ├── save-next-cache/               # .next/cache save (after build)
│   └── cleanup-ci-workspace/          # Runner workspace cleanup profiles
└── workflows/
    ├── ci.yml                         # Orchestrator (entry point)
    ├── deploy-preview.yml             # Preview deploy (separate from CI)
    └── reusable/
        ├── dependency-review.yml
        ├── osv-scan-pr.yml
        ├── osv-scan-main.yml
        ├── ci-checks.yml                # lint | test | build matrix
        ├── base-coverage.yml
        ├── coverage-report.yml
        ├── security-gates.yml
        ├── ci-summary.yml
        └── cleanup.yml
```

## Orchestration (`ci.yml`)

`ci.yml` defines triggers, concurrency, top-level permissions, and job dependencies only. It does not contain setup or test logic.

### Job graph

```
dependency_review ──┐
osv_scan_pr/main ───┼──► security_gates ──► ci_summary ──► cleanup
ci-checks ──────────┘         ▲
    │                         │
    └──► coverage_report ─────┘ (PR only)
base_coverage ──────► coverage_report (PR only)
```

### Triggers

- **pull_request** (`opened`, `synchronize`, `reopened`) with path filters
- **push** to `main` with the same path filters

### Concurrency

- Group: `ci-${{ github.ref }}`
- `cancel-in-progress: true`

## Reusable workflows

| Workflow | Purpose |
| --- | --- |
| `dependency-review.yml` | Dependency Review action |
| `osv-scan-pr.yml` | OSV scanner (PR reusable) |
| `osv-scan-main.yml` | OSV scanner (main, HIGH/CRITICAL) |
| `ci-checks.yml` | Matrix: lint, test, build |
| `base-coverage.yml` | Coverage baseline from PR base branch |
| `coverage-report.yml` | Coverage delta + sticky PR comment |
| `security-gates.yml` | Gate job when all checks pass |
| `ci-summary.yml` | Workflow step summary table |
| `cleanup.yml` | Delete workflow run artifacts |

## Composite actions

| Action | Used by |
| --- | --- |
| `setup-node-environment` | `ci-checks`, `base-coverage` |
| `install-dependencies` | `ci-checks`, `base-coverage` |
| `restore-next-cache` | `ci-checks` (all matrix legs) |
| `restore-jest-cache` | `ci-checks`, `base-coverage` |
| `save-next-cache` | `ci-checks` (build leg) |
| `cleanup-ci-workspace` | All jobs that install dependencies |

### Caching strategy

| Cache | Key | Restore keys |
| --- | --- | --- |
| npm (via setup-node) | Managed by `actions/setup-node` | — |
| `node_modules` | `node-modules-${{ runner.os }}-${{ hashFiles('package-lock.json') }}` | `node-modules-${{ runner.os }}-` |
| `.next/cache` | `next-${{ runner.os }}-${{ hashFiles('package-lock.json') }}` | `next-${{ runner.os }}-` |
| Jest | `jest-${{ runner.os }}-${{ hashFiles('package-lock.json', 'jest.config.js') }}` | `jest-${{ runner.os }}-` |

Build saves `.next/cache` after the build matrix leg completes.

### Dependabot

When `github.actor` is `dependabot[bot]`, `install-dependencies` runs `npm install --package-lock-only` before `npm ci`.

## Artifacts

| Name | Producer | Consumer | Retention |
| --- | --- | --- | --- |
| `test-report` | `ci-checks` (test) | `coverage-report` | 7 days |
| `base-coverage-report` | `base-coverage` | `coverage-report` | 1 day |

`cleanup` deletes all artifacts for the workflow run after `ci_summary` completes.

## Reporting

| Output | Where |
| --- | --- |
| Jest GitHub Check | `dorny/test-reporter` in `ci-checks` (test leg) |
| Test step summary | `GITHUB_STEP_SUMMARY` in `ci-checks` (test leg) |
| CI timing summary | `ci-summary` reusable workflow |
| PR sticky comment | `coverage-report` (`header: pr-ci-report`) |

Preview deployment comments are handled by `deploy-preview.yml` (separate workflow).

## Adding a new CI job

1. Add logic to a new file under `.github/workflows/reusable/`.
2. Expose it via `on: workflow_call`.
3. Wire the job in `ci.yml` with correct `needs` / `if`.
4. Reuse composite actions for Node setup and caching.
5. Update this README.

## Branch protection

The merge gate check is **`CI / security_gates`** (after reusable workflow extraction, job id remains `security_gates`).

Matrix checks appear as **`CI / ci-checks / ci-checks (lint|test|build)`**.

## Related workflows

- **`deploy-preview.yml`** — Cloudflare preview deploy (runs in parallel with CI on PRs; not part of `ci.yml`).
- **`codeql.yml`**, **`deploy-staging.yml`**, **`deploy.yml`** — separate release/security pipelines.
