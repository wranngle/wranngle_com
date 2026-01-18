# Wranngle Systems

Wranngle Systems is an AI and automation consultancy. This project is the official website and landing page, featuring a console-themed UI and an integrated ElevenLabs Conversational AI agent.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Frontend:** React, Tailwind CSS, Framer Motion, Radix UI
- **Backend:** Express.js
- **Validation:** Arktype
- **AI Integration:** ElevenLabs Conversational AI

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your machine.

### Installation

```bash
bun install
```

### Development

Start the development server (runs backend with hot reload and frontend via Vite middleware):

```bash
bun run dev
```

The application will be available at `http://localhost:5000`.

### Build & Production

To build the project for production:

```bash
bun run build
```

To start the production server:

```bash
bun run start
```

## Project Structure

- `client/`: React frontend source code.
- `server/`: Express backend source code.
- `shared/`: Shared TypeScript schemas and utilities.
- `script/`: Build and utility scripts.
- `openspec/`: Project specifications and change proposals.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
