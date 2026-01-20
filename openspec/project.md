# Project Context

## Purpose
The project is the web application and landing page for **Wranngle Systems**, an AI and automation consultancy. It features a distinct "console" aesthetic and integrates an **ElevenLabs Conversational AI** agent (`agent_8001kdgp7qbyf4wvhs540be78vew`). The application aims to showcase the consultancy's services and demonstrate their capabilities through the interactive AI agent.

## Tech Stack
- **Language:** TypeScript
- **Runtime:** Bun (local dev), Cloudflare Workers (production)
- **Frontend:**
  - React
  - Tailwind CSS (Styling)
  - Framer Motion (Animations)
  - Radix UI Primitives (via `components/ui`)
  - Lucide React (Icons)
  - Vite (Build/Dev tool)
  - Wouter (Routing)
  - React Query (Data Fetching)
- **Backend:**
  - Cloudflare Pages Functions (Serverless API)
  - ArkType (Validation)
  - n8n (Workflow Automation)
- **Database:** None yet (planned: PostgreSQL via Drizzle ORM)
- **Hosting:** Cloudflare Pages (free tier)
- **Linting:** XO

## Project Conventions

### Code Style
- **Formatting:** Prettier (via XO).
- **Naming:** CamelCase for variables/functions, PascalCase for components/classes.
- **File Structure:**
  - `client/`: Frontend React app (SPA built with Vite).
  - `functions/`: Cloudflare Pages Functions (serverless API endpoints).
  - `shared/`: Shared types and validation schemas (ArkType).
  - `script/`: Build and utility scripts.
  - `workflows/`: n8n workflow definitions.
  - `openspec/`: Project specifications and change proposals.

### Architecture Patterns
- **Static Site + Serverless API:** React SPA built with Vite, served via Cloudflare Pages CDN. API routes (`/api/*`) handled by Cloudflare Pages Functions.
- **Shared Schema:** Validation schemas defined in `shared/schema.ts` using ArkType for type safety.
- **Workflow Automation:** Lead processing and notifications handled by n8n workflows.
- **UI Components:** Reusable components located in `client/src/components/ui`, based on Shadcn/Radix patterns.
- **Path Aliases:** `@` → `client/src`, `@shared` → `shared` (configured in vite.config.ts and tsconfig.json).

### Testing Strategy
- **Type Checking:** Strict TypeScript configuration (`tsc`).
- **Linting:** XO for code quality and style enforcement.

### Git Workflow
- Standard feature-branch workflow.
- Commit messages should be clear and descriptive.

## Domain Context
- **Wranngle Systems:** Specializes in AI agents, automation, and system integration.
- **Console Aesthetic:** The UI design mimics a terminal/console environment (monospaced fonts, high contrast, technical look).
- **ElevenLabs Integration:** The site features a prominent conversational AI agent using ElevenLabs' web component technology.

## Important Constraints
- **Performance:** The "console" aesthetic should not compromise load times; fonts and assets must be optimized.
- **Type Safety:** All API inputs/outputs must be validated using ArkType schemas in `shared/schema.ts`.
- **Environment:** Requires `N8N_WEBHOOK_URL` environment variable for lead processing. Optional: `ALLOWED_ORIGIN` for CORS configuration.
- **Serverless:** All backend logic must be compatible with Cloudflare Workers runtime (no Node.js-specific APIs).

## External Dependencies
- **ElevenLabs:** Used for the conversational AI agent (Agent ID: `agent_8001kdgp7qbyf4wvhs540be78vew`).
- **n8n:** Self-hosted workflow automation platform at `n8n.wranngle.com` for lead processing and notifications.
- **Cloudflare Pages:** Hosting platform for static site and serverless functions.
- **Google Fonts:** Bricolage Grotesque and JetBrains Mono.