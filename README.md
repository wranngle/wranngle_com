# wranngle_com

> a console-themed lead intake platform and elevenlabs voice agent for small trades businesses.

[![License](https://img.shields.io/github/license/wranngle/wranngle_com?color=A371F7)](./LICENSE) ![Status](https://img.shields.io/badge/status-experimental-orange.svg)

> [!NOTE]
> Experiment. Built to learn one specific thing. Code may not survive.

## Quick start

```bash
git clone https://github.com/wranngle/wranngle_com.git
cd wranngle_com
bun install
```

## What it does

This serves the frontend for Wranngle Systems and provides serverless functions to process incoming leads. It uses arktype to validate form submissions before sending them to an n8n webhook. An embedded elevenlabs agent allows visitors to speak directly with an AI representative.

## Usage

Start the local development server:

```bash
bun run dev
```

The application runs at `http://localhost:5173`. To preview the email templates locally, run `bun run email:preview:all`.

## License

[LICENSE](./LICENSE)
