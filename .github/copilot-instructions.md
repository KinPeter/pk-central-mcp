# Project Guidelines

## Overview

`pk-central-mcp` is an MCP (Model Context Protocol) server that exposes tools for AI assistants to interact with the PK-Central API. See [README.md](../README.md) for setup, environment variables, and client configuration.

## Build and Run

```bash
npm run build      # compile TypeScript → dist/
npm run dev        # watch mode (recompiles on change, does not restart server)
npm run start      # run compiled server (stdio transport)
npm run lint       # ESLint
npm run lint:fix   # ESLint with auto-fix
npm run format     # Prettier write
```

After any code change, rebuild with `npm run build` before testing. There are no automated tests — validate by connecting an MCP client.

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

Use `apiFetch<T>(path)` from `api-client.ts`. It reads `API_BASE_URL` and `API_KEY` from environment variables. Define TypeScript interfaces for response shapes in the `.api.ts` file.

### OpenAPI spec for PK Central API

The OpenAPI spec for the PK Central API is available to use as a reference when implementing new features. Check the `.temp` folder whether there is a downloaded copy of the spec or fetch it from [https://api.p-kin.com/central/v2/openapi.json](https://api.p-kin.com/central/v2/openapi.json). Use it as a reference when implementing API calls in the `.api.ts` files.

## Code Style

TypeScript strict mode, ES Modules (`"type": "module"`). ESLint + Prettier are configured — run `npm run lint:fix && npm run format` before committing. Configuration in [eslint.config.js](../eslint.config.js) and [.prettierrc](../.prettierrc).
