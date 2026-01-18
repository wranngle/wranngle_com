# Project Context

## Purpose
The project is the web application and landing page for **Wranngle Systems**, an AI and automation consultancy. It features a distinct "console" aesthetic and integrates an **ElevenLabs Conversational AI** agent (`agent_8001kdgp7qbyf4wvhs540be78vew`). The application aims to showcase the consultancy's services and demonstrate their capabilities through the interactive AI agent.

## Tech Stack
- **Language:** TypeScript
- **Runtime:** Node.js (with Bun for scripts/builds)
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
  - Express.js
  - Drizzle ORM (Database Access)
  - ArkType (Validation via `drizzle-arktype`)
  - esbuild (Bundler)
- **Database:** PostgreSQL
- **Linting:** XO

## Project Conventions

### Code Style
- **Formatting:** Prettier (via XO).
- **Naming:** CamelCase for variables/functions, PascalCase for components/classes.
- **File Structure:**
  - `client/`: Frontend React app.
  - `server/`: Backend Express app.
  - `shared/`: Shared types and schema (Drizzle/ArkType).
  - `script/`: Build and utility scripts.

### Architecture Patterns
- **Monorepo-lite:** Single repository containing both client and server, sharing code via the `shared` directory.
- **Shared Schema:** Database schema and validation types are defined in `shared/schema.ts` to ensure consistency between frontend and backend.
- **API First:** Backend serves API routes under `/api`, and serves the static frontend for all other routes in production.
- **UI Components:** Reusable components located in `client/src/components/ui`, largely based on Shadcn/Radix patterns.

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
- **Type Safety:** Changes to the database schema must be reflected in `shared/schema.ts` to maintain full-stack type safety.
- **Environment:** Requires a PostgreSQL connection (`DATABASE_URL`) for full functionality.

## External Dependencies
- **ElevenLabs:** Used for the conversational AI agent (Agent ID: `agent_8001kdgp7qbyf4wvhs540be78vew`).
- **Google Fonts:** Bricolage Grotesque and JetBrains Mono.