# Wranngle Systems

Wranngle Systems is an AI and automation consultancy. This project is the official website and landing page, featuring a console-themed UI and an integrated ElevenLabs Conversational AI agent.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh) (local dev), Cloudflare Workers (production)
- **Frontend:** React, Tailwind CSS, Framer Motion, Radix UI
- **Backend:** Cloudflare Pages Functions (serverless)
- **Validation:** ArkType
- **AI Integration:** ElevenLabs Conversational AI
- **Hosting:** Cloudflare Pages (free tier)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your machine.

### Installation

```bash
bun install
```

### Development

Start the development server (Vite dev server with hot reload):

```bash
bun run dev
```

The application will be available at `http://localhost:5173`.

### Build & Production

To build the project for production:

```bash
bun run build
```

To preview the production build locally with Cloudflare Pages Functions:

```bash
bun run preview
```

To deploy to Cloudflare Pages:

```bash
bun run deploy
```

## Project Structure

- `client/`: React frontend source code.
- `functions/`: Cloudflare Pages Functions (serverless API endpoints).
- `shared/`: Shared TypeScript schemas and utilities (ArkType).
- `script/`: Build and utility scripts.
- `email-templates/`: Production-ready email template system with master inheritance.
- `openspec/`: Project specifications and change proposals.
- `docs/`: Project documentation and architecture guides.

## Architecture

This is a static site with serverless API functions:

- **Frontend**: React SPA built with Vite, served globally via Cloudflare Pages CDN
- **API**: Cloudflare Pages Functions handle `/api/*` routes (e.g., `/api/leads`)
- **Lead Capture**: Form submissions are validated with ArkType and forwarded to an n8n webhook
- **Email System**: Production-ready transactional email templates with master inheritance
- **Environment Variables**: Set `N8N_WEBHOOK_URL` in Cloudflare Pages dashboard

## Email Templates

This project includes a comprehensive email template system. See [`email-templates/README.md`](email-templates/README.md) for full documentation.

### Quick Start

```bash
# Preview all email templates
bun run email:preview:all
open email-templates/preview/index.html

# Build a specific template
bun run email:build welcome

# Run validation tests
bun run email:test
```

**Available Templates:**
- Welcome email (onboarding)
- Invoice/Receipt (billing)
- Notification (real-time alerts)
- Password reset (security)

**Key Features:**
- ✅ Cross-client compatible (Gmail, Outlook, Apple Mail, etc.)
- ✅ Mobile responsive
- ✅ Deliverability optimized (spam score: 8.5/10)
- ✅ Brand-consistent design
- ✅ Master template inheritance

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
