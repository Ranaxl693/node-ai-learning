# Node AI Learning

A Node.js + TypeScript + Express backend POC for learning AI integration step by step.
The chat endpoint is a **mock**, not an LLM. It requires no API key and makes no external AI calls.

## Quick start

Use Node.js 24 (see `.nvmrc`).

```bash
npm ci
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.
Server: http://127.0.0.1:3000. Edit `.env` to change the host or port.

```bash
curl http://127.0.0.1:3000/health
curl -X POST http://127.0.0.1:3000/api/chat -H 'Content-Type: application/json' -d '{"message":"Explain AI agents"}'
```

Chat response:

```json
{
  "mode": "mock",
  "reply": "Mock response: you said \"Explain AI agents\". No AI provider is connected."
}
```

## Commands

| Command                | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start with automatic restart using tsx       |
| `npm run build`        | Compile source to dist                       |
| `npm start`            | Run compiled server (build first)            |
| `npm run typecheck`    | Check source and tests                       |
| `npm run lint`         | ESLint                                       |
| `npm test`             | API tests using Node test runner + Supertest |
| `npm run format`       | Format files                                 |
| `npm run format:check` | Check formatting                             |
| `npm run check`        | Typecheck, lint, formatting, tests, build    |

## Structure

- `src/server.ts`: listener and graceful shutdown.
- `src/app.ts`: middleware and routes; separate from the listener for tests.
- `src/config/`: validated environment and structured logger.
- `src/routes/chat.ts`: validated mock chat route; future provider integration starts here.
- `src/middleware/error-handler.ts`: consistent JSON errors.
- `tests/`: endpoint and configuration tests.

## Included

Express 5, strict TypeScript with ESM, dotenv + Zod, Helmet headers, configurable CORS,
30 API requests per minute per IP, 16 KB JSON limit, Pino logs with generated request IDs,
404/error handling, lockfile, ESLint, Prettier and tests.
Logs omit request bodies, headers and URLs to avoid recording prompts or credentials.

## Configuration

| Variable      | Default                 |
| ------------- | ----------------------- |
| `NODE_ENV`    | `development`           |
| `HOST`        | `127.0.0.1`             |
| `PORT`        | `3000`                  |
| `CORS_ORIGIN` | `http://localhost:4200` |
| `LOG_LEVEL`   | `info`                  |

The app validates environment values on startup. `.env` stays out of Git.
The default host is local-only; use `HOST=0.0.0.0` for a container when needed.
CORS controls browser access; it is not authentication. This is a local learning POC:
before exposing it publicly, add authentication and deployment-specific proxy settings.
The in-memory rate limit resets on restart and is not shared across instances.

## Next learning milestones

1. Add an LLM provider service and server-side API key configuration.
2. Learn system/user messages, structured outputs and streaming.
3. Add tool calling with validated tool inputs.
4. Add document retrieval (RAG), then evaluation examples.

No database, frontend or AI framework is required for this starting point.
