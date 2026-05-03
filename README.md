# wranngle_com

> a console-themed lead intake frontend with an embedded elevenlabs voice agent.

[![License](https://img.shields.io/github/license/wranngle/wranngle_com?color=A371F7)](./LICENSE) ![Status](https://img.shields.io/badge/status-active-brightgreen.svg)

> [!NOTE]
> Active personal project. Used in my own workflow. Issues triaged on a personal-time cadence.

## Quick start

```bash
git clone https://github.com/wranngle/wranngle_com.git
cd wranngle_com
bun install
```

## What it does

This serves the frontend for Wranngle Systems and provides serverless functions to process incoming leads. It uses Arktype to validate form submissions before sending them to an n8n webhook. An embedded ElevenLabs agent allows visitors to speak directly with an AI representative.

## Usage

Start the local development server:

```bash
bun run dev
```

The application runs at `http://localhost:5000`.

## License

[LICENSE](./LICENSE)
