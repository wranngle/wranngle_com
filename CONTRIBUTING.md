# Contributing to wranngle_com

Thanks for your interest in helping out! This is an experimental project—built to learn and move fast—so the process here is lightweight and informal.

## Getting started locally

We use [Bun](https://bun.sh/) for package management and script running. To get the project set up on your machine:

1. Clone the repo.
2. Run `bun install` to install dependencies.
3. Run `bun run dev` to start the local development server at `http://localhost:5173`.

If you need to test the email templates locally, you can use `bun run email:preview:all`.

## Running tests

Before you submit any changes, please make sure the test suite passes. If you are introducing new behavior or fixing a bug, adding a test is highly appreciated.

You can run the tests using:

`bun test`

## Code style

We rely on automated tooling rather than a massive rulebook to keep the codebase consistent.

- Check your code with `bun run lint`.
- If you are touching UI code, please review [`DESIGN.md`](DESIGN.md) first—it is the canonical source of truth for our design tokens and aesthetic.
- Keep it simple and pragmatic.

## Filing a Pull Request

1. Create a new branch for your feature or fix.
2. Write a clear PR description explaining *why* the change is needed and *how* you solved it.
3. Keep PRs small and focused on a single issue.
4. Ensure all CI checks and tests pass before requesting a review.

## Questions, bugs, and ideas

- **Have a question, suggestion, or want to discuss a new feature?** Head over to [GitHub Discussions](https://github.com/wranngle/wranngle_com/discussions). It's the perfect place for open-ended chats.
- **Found a reproducible bug?** Please file an [Issue](https://github.com/wranngle/wranngle_com/issues). Include what happened, what you expected to happen, and the steps to reproduce it.

We appreciate your help and time!
