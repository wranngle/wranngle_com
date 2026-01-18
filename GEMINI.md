# Wranngle Systems - Project Context

## Project Overview
This project is the web application and landing page for **Wranngle Systems**, an AI and automation consultancy. It features a distinct "console" aesthetic and integrates an **ElevenLabs Conversational AI** agent.

The application is a full-stack **TypeScript** project structured as a monorepo, utilizing **Express** for the backend and **React** for the frontend, built with **Vite**.

## Tech Stack
- **Language:** TypeScript
- **Runtime:** Bun
- **Frontend:** React, Tailwind CSS, Framer Motion, Radix UI Primitives, Lucide Icons.
- **Backend:** Express.js.
- **Validation:** Arktype.
- **Storage:** In-memory `MemStorage` (implemented in `server/storage.ts`).
- **Build Tooling:** Vite (Frontend), esbuild (Backend bundling).
- **Integrations:** ElevenLabs (`elevenlabs-convai` web component).

## Directory Structure
- **`client/`**: Frontend source code.
  - **`src/App.tsx`**: Main application component containing the landing page layout and logic.
  - **`src/components/ui/`**: Reusable UI components (based on Radix UI).
  - **`src/hooks/`**: Custom React hooks.
- **`server/`**: Backend source code.
  - **`index.ts`**: Entry point. Sets up the Express server and middleware.
  - **`routes.ts`**: API route definitions.
  - **`storage.ts`**: In-memory data storage implementation.
- **`shared/`**: Code shared between client and server.
  - **`schema.ts`**: Data validation schemas using Arktype.
- **`script/`**: Build and utility scripts.
  - **`build.ts`**: Custom build script that handles both client (Vite) and server (esbuild) bundling.

## Development Workflow

### Prerequisites
- Bun runtime

### Key Commands
- **Install Dependencies:** `bun install`
- **Start Development Server:** `bun run dev`
  - Runs the backend with Bun (hot reload) and the frontend via Vite middleware.
  - Access at `http://localhost:5000` (default).
- **Type Checking:** `bun run check` (runs `tsc`)

### Build & Production
- **Build:** `bun run build`
  - Cleans `dist/`.
  - Builds frontend using Vite.
  - Bundles backend using `esbuild` into `dist/index.cjs`.
- **Start Production:** `bun run start`
  - Executes the bundled server: `bun run dist/index.cjs`.

## Architecture & Conventions

### Shared Schema
Data models are defined in `shared/schema.ts`. This file exports Arktype schemas for type safety across the full stack.
- **Example:** `userSchema` and `insertUserSchema`.

### API Routes
- API routes are defined in `server/routes.ts` and registered in `server/index.ts`.
- The backend serves API requests starting with `/api` and falls back to serving the static frontend client for all other routes (in production).

### Frontend Styling
- **Tailwind CSS** is used for styling.
- **Fonts:** Bricolage Grotesque and JetBrains Mono are loaded via Google Fonts.
- **Colors:** Custom brand colors (e.g., `--s500`, `--v500`) are defined in global styles within `App.tsx` or CSS files.

### ElevenLabs Integration
- The conversational agent is embedded using the `<elevenlabs-convai>` custom element.
- **Agent ID:** `agent_8001kdgp7qbyf4wvhs540be78vew`.
- The integration script is dynamically injected in `App.tsx`.
