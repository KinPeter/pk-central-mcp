# Project Guidelines

## Overview

`pk-central-mcp` is an MCP (Model Context Protocol) server that exposes tools for AI assistants to interact with the PK-Central API. See [README.md](../README.md) for setup, environment variables, and client configuration.

## Build and Run

```bash
npm run build        # compile TypeScript → dist/
npm run dev          # watch mode (recompiles on change, does not restart server)
npm run start        # run compiled server (stdio transport)
npm run dev:http     # run server in HTTP transport mode, loading vars from .env
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier write
npm run local        # start local opencode container (docker-compose.local.yml)
npm run local:stop   # stop local container and remove volumes
npm run deploy       # bump patch version, build TS, build & push Docker image
```

After any code change, rebuild with `npm run build` before testing. There are no automated tests — validate by connecting an MCP client.

## Transport Modes

The server supports two transports, selected via the `MCP_TRANSPORT` environment variable:

- **stdio** (default): client launches the process; `API_BASE_URL` and `API_KEY` are injected by the MCP client config.
- **http**: runs a standalone Streamable HTTP server on `MCP_PORT` (default `4999`). All env vars must be set upfront (e.g. via `.env`). Bearer token auth is enforced via `MCP_AUTH_TOKEN` — if not set, the server rejects all requests with `500`.

The `dev-http.sh` script loads `.env` and sets `MCP_TRANSPORT=http` before starting the server. It is invoked by `npm run dev:http`.

## Environment Variables

| Variable         | Default                            | Used in       | Description                           |
| ---------------- | ---------------------------------- | ------------- | ------------------------------------- |
| `API_BASE_URL`   | `http://localhost:5500/central/v2` | api-client.ts | Base URL of the PK-Central API        |
| `API_KEY`        | —                                  | api-client.ts | API key for the PK-Central API        |
| `MCP_TRANSPORT`  | `stdio`                            | index.ts      | Transport mode: `stdio` or `http`     |
| `MCP_PORT`       | `4999`                             | index.ts      | HTTP server port                      |
| `MCP_HOST`       | `0.0.0.0`                          | index.ts      | HTTP server bind address              |
| `MCP_AUTH_TOKEN` | —                                  | index.ts      | Bearer token for HTTP auth (required) |

## Docker

Two Docker setups exist:

- **Local** (`docker-compose.local.yml` + `Dockerfile.local`): mounts `dist/` and `node_modules/` as volumes for fast iteration. Use `npm run local` / `npm run local:stop`.
- **Production** (`docker-compose.yml` + `Dockerfile`): builds a self-contained `node:22-alpine` image running the MCP server in HTTP mode. Published to Docker Hub as `kinp/pk-central-mcp:<version>`. Use `npm run deploy` to bump the patch version in `package.json`, compile, build, and push the image. The version in `docker-compose.yml` is updated automatically by `deploy.sh`. On the server, variables (`API_BASE_URL`, `API_KEY`, `MCP_AUTH_TOKEN`) are loaded from a `.env` file via `env_file` in the compose file.

## Architecture

```
src/
├── index.ts              # Server bootstrap; imports and registers all modules
├── api-client.ts         # Shared HTTP client (apiFetch<T>)
└── modules/
    └── {feature}/
        ├── {feature}.tools.ts  # MCP tool registration & input schemas
        └── {feature}.api.ts    # API calls & TypeScript interfaces
```

## Conventions

### Adding a new module a.k.a. feature

1. Create `src/modules/{feature}/{feature}.api.ts` — define response interfaces and `apiFetch<T>()` calls
2. Create `src/modules/{feature}/{feature}.tools.ts` — export `register{Feature}Tools(server: McpServer)`
3. Register it in `src/index.ts`

### Tool registration pattern

```typescript
server.registerTool(
  'tool-name',
  {
    description: 'Description for the AI assistant.',
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    const data = await getThingById(id);
    return { content: [{ type: 'text', text: `Result: ${data.title}` }] };
  },
);
```

### API client

Use `apiFetch<T>(path)` from `api-client.ts`. It reads `API_BASE_URL` and `API_KEY` from environment variables. In stdio mode these are injected by the MCP client; in HTTP mode they must be set in the environment (e.g. `.env`). Define TypeScript interfaces for response shapes in the `.api.ts` file.

### OpenAPI spec for PK Central API

The OpenAPI spec for the PK Central API is available to use as a reference when implementing new features. Check the `.temp` folder whether there is a downloaded copy of the spec or fetch it from [https://api.p-kin.com/central/v2/openapi.json](https://api.p-kin.com/central/v2/openapi.json). Use it as a reference when implementing API calls in the `.api.ts` files.

## Code Style

TypeScript strict mode, ES Modules (`"type": "module"`). ESLint + Prettier are configured — run `npm run lint:fix && npm run format` before committing. Configuration in [eslint.config.js](../eslint.config.js) and [.prettierrc](../.prettierrc).
