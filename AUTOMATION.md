# Automation Contract

This repo is dotfiles-managed. The primitive contract lives in
`.automation/policy.json`; generated workflows, labels, repo settings, and local
autosync behavior should converge on that file.

## Loop

1. Observe local Git state without reading secrets or large diffs.
2. Checkpoint dirty work to a neutral `wip/local/<branch>` ref, or an explicit `wip/<namespace>/<branch>` ref.
3. Integrate only after the tree is quiet and required checks are green.
4. Prefer GitHub auto-merge with squash and branch deletion.
5. Repair tree-equivalent local divergence after squash merges.
6. Stop on semantic conflicts, active leases, unsafe Git states, or secrets.

## Universal GitHub Failure Prevention

All generated artifacts pass through the same local contract before they are
written: normalize trailing whitespace, parse by file type, block shellcheck
warnings when shellcheck is installed, and block yamllint failures when
yamllint is installed. GitHub Actions should confirm the same checks, not be
the first place a deterministic bootstrap defect is discovered.

Repository-administration advisory scans, including OpenSSF Scorecard, are
non-blocking. Findings that require branch protection or ruleset changes should
upload SARIF and annotations, but must not fail generated repo-content
workflows.

Legacy self-repair or AI-review workflows that create notification loops are
retired into `old/` during bootstrap. Current automation may open PRs and rely
on required checks, but it must not keep pushing failing repairs into the same
branch.

Routine policy failures should use check conclusions and labels, not repeated
bot comments. Comments are reserved for durable review findings or security
context that cannot be represented as a check annotation, label, or workflow
summary.

## Local Commands

All Git automation is now the single binary `git_good`
(`~/.dotfiles/scripts/bin/git_good`), which replaced the older
`repo-automation.sh`, `github-hygiene.sh`, `git-autosync.sh`,
`agent-git-guard.sh`, `git-conformance`, `git-wip-gc`, and `gh-issue.sh`.

```bash
git_good observe               # dump current repo state as NDJSON
git_good status                # human-readable repo + ledger summary
git_good conform               # verify repo matches the hardcoded contract
git_good triage                # list recent GitHub Actions failures
git_good repair                # retire legacy AI/self-repair workflows
git_good sync                  # autostash dirty tree (local-only; cron also runs this)
git_good unstash               # pop the latest git_good stash
git_good gc                    # drop stashes >30d + prune patches
git_good guard baseline|finalize  # NDJSON pre/post guard, fails closed
git_good defaults              # print the hardcoded constants
git_good --dry-run <sub>       # demote any mutating subcommand to print-only
```

Runtime artifacts live under `<repo>/.artifacts/git_good/`:
`events.<date>.jsonl` (ECS-shaped event ledger, date-keyed), flat
`stash.<uuid>.patch` files, and `baseline.<session>.tsv` for the guard
contract. A cron entry runs `git_good sync` every 15 minutes locally
to keep dirty trees auto-stashed.
