# pk-central-mcp

An MCP (Model Context Protocol) server that exposes tools for interacting with [PK-Central](https://github.com/KinPeter/pk-central-v2) — a personal API for managing documents, notes, flights, visits, and more.

Designed to be used with AI assistants like GitHub Copilot, Claude Desktop, or any other MCP-compatible client. Supports both **stdio** and **HTTP (Streamable HTTP)** transports.

## Dependencies

- **Node.js** v22+
- **[@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)** — MCP server framework
- **[zod](https://zod.dev)** — schema validation for tool inputs
- **[express](https://expressjs.com)** — HTTP server for HTTP transport mode

## Setup

```bash
npm install
npm run build
```

## npm Scripts

| Script               | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `npm run build`      | Compile TypeScript to `dist/`                           |
| `npm run dev`        | Watch mode — recompiles on file changes                 |
| `npm run start`      | Run the compiled server (stdio)                         |
| `npm run dev:http`   | Run the server in HTTP mode, loading vars from `.env`   |
| `npm run lint`       | Run ESLint                                              |
| `npm run lint:fix`   | Run ESLint with auto-fix                                |
| `npm run format`     | Format source files with Prettier                       |
| `npm run local`      | Start local opencode container (docker compose up)      |
| `npm run local:stop` | Stop and remove local container volumes                 |
| `npm run deploy`     | Bump patch version, build TS, build & push Docker image |

## Transport Modes

The server supports two transport modes controlled by the `MCP_TRANSPORT` environment variable.

### stdio (default)

Standard input/output transport. The MCP client launches the server process and communicates over stdin/stdout. `API_BASE_URL` and `API_KEY` are injected by the client.

### HTTP (Streamable HTTP)

The server runs as a standalone HTTP server. Authentication is required via a bearer token. All environment variables must be set before starting (e.g. via `.env`).

```bash
npm run dev:http   # loads .env, sets MCP_TRANSPORT=http, starts server
```

## Environment Variables

| Variable         | Default                            | Description                                            |
| ---------------- | ---------------------------------- | ------------------------------------------------------ |
| `API_BASE_URL`   | `http://localhost:5500/central/v2` | Base URL of the PK-Central API (stdio mode)            |
| `API_KEY`        | —                                  | API key for the PK-Central API (stdio mode)            |
| `MCP_TRANSPORT`  | `stdio`                            | Transport mode: `stdio` or `http`                      |
| `MCP_PORT`       | `4999`                             | Port to listen on (HTTP mode)                          |
| `MCP_HOST`       | `0.0.0.0`                          | Hostname to bind to (HTTP mode)                        |
| `MCP_AUTH_TOKEN` | —                                  | Bearer token for HTTP auth — **required** in HTTP mode |

> In HTTP mode `MCP_AUTH_TOKEN` must be set or the server will reject all requests with `500`.

## MCP Client Configuration

### stdio — same system

```json
{
  "servers": {
    "pk-central": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/central-mcp/dist/index.js"],
      "env": {
        "API_BASE_URL": "https://your-api-host/central/v2",
        "API_KEY": "<api key here>"
      }
    }
  }
}
```

### stdio — Windows MCP client → WSL Node.js

If the MCP client is installed on Windows but Node.js and the server live inside WSL, env vars must be injected via the Linux `env` command, and the Node.js binary must be referenced by its absolute path (e.g. if installed via nvm):

```json
{
  "servers": {
    "pk-central": {
      "type": "stdio",
      "command": "wsl",
      "args": [
        "env",
        "API_BASE_URL=http://localhost:5500/central/v2",
        "API_KEY=<api key here>",
        "/home/peter/.nvm/versions/node/v22.5.1/bin/node",
        "/home/peter/code/central-mcp/dist/index.js"
      ]
    }
  }
}
```

### HTTP (Streamable HTTP)

```json
{
  "servers": {
    "pk-central": {
      "type": "streamable-http",
      "url": "https://your-domain.com/central-mcp/mcp",
      "headers": {
        "Authorization": "Bearer <mcp-auth-token>"
      }
    }
  }
}
```

> **Note:** After any code change, run `npm run build` and restart the MCP server in your client.

## Docker

### Production image

The production `Dockerfile` builds a self-contained Node.js image that runs the MCP server in HTTP mode. It is published to Docker Hub as `kinp/pk-central-mcp`.

```bash
npm run deploy   # bumps patch version in package.json, builds TS, builds & pushes Docker image
```

The production `docker-compose.yml` references the published image and loads all variables from a `.env` file on the server:

| Variable         | Description                    |
| ---------------- | ------------------------------ |
| `API_BASE_URL`   | Base URL of the PK-Central API |
| `API_KEY`        | API key for the PK-Central API |
| `MCP_AUTH_TOKEN` | Bearer token for HTTP auth     |

### nginx reverse proxy

When hosting behind nginx, the `/mcp` endpoint requires SSE-friendly configuration:

```nginx
location /central-mcp/ {
    proxy_pass http://localhost:4999/;
    proxy_http_version 1.1;

    proxy_buffering off;
    proxy_cache off;
    proxy_set_header Connection '';

    proxy_read_timeout 24h;
    proxy_send_timeout 24h;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
