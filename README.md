# pk-central-mcp

An MCP (Model Context Protocol) server that exposes tools for interacting with [PK-Central](https://github.com/KinPeter/pk-central-v2) — a personal API for managing documents, notes, flights, visits, and more.

Designed to be used with AI assistants like GitHub Copilot, Claude Desktop, or any other MCP-compatible client.

## Dependencies

- **Node.js** v20+
- **[@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)** — MCP server framework
- **[zod](https://zod.dev)** — schema validation for tool inputs

## Setup

```bash
npm install
npm run build
```

## npm Scripts

| Script               | Description                                        |
| -------------------- | -------------------------------------------------- |
| `npm run build`      | Compile TypeScript to `dist/`                      |
| `npm run dev`        | Watch mode — recompiles on file changes            |
| `npm run start`      | Run the compiled server                            |
| `npm run lint`       | Run ESLint                                         |
| `npm run lint:fix`   | Run ESLint with auto-fix                           |
| `npm run format`     | Format source files with Prettier                  |
| `npm run local`      | Start local opencode container (docker compose up) |
| `npm run local:stop` | Stop and remove local container volumes            |
| `npm run deploy`     | Bump version, build, and push image to Docker Hub  |

## Environment Variables

| Variable       | Default                            | Description                                                   |
| -------------- | ---------------------------------- | ------------------------------------------------------------- |
| `API_BASE_URL` | `http://localhost:5500/central/v2` | Base URL of the PK-Central API                                |
| `API_KEY`      | —                                  | API key generated via the PK-Central `/auth/api-key` endpoint |

## MCP Client Configuration

### Standard (same system)

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

### Running in WSL (Windows MCP Client → WSL Node.js)

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

> **Note:** After any code change, run `npm run build` and restart the MCP server in your client.

## Docker

### Local development (opencode)

The local setup runs the [opencode](https://opencode.ai) web UI with the MCP server mounted from the host. `dist/` and `node_modules/` are volume-mounted so you can rebuild without rebuilding the image.

```bash
npm run local        # docker compose -f docker-compose.local.yml up
npm run local:stop   # docker compose -f docker-compose.local.yml down -v
```

Required environment variables in a `.env` file or shell:

| Variable                   | Description                    |
| -------------------------- | ------------------------------ |
| `OPENCODE_SERVER_USERNAME` | opencode web UI username       |
| `OPENCODE_SERVER_PASSWORD` | opencode web UI password       |
| `PK_CENTRAL_BASE_URL`      | Base URL of the PK-Central API |
| `PK_CENTRAL_API_KEY`       | API key for the PK-Central API |

### Production image

The production `Dockerfile` builds a self-contained image based on the opencode base image, installs Node.js, copies `dist/` and the opencode config files, and packages everything into a single image published to Docker Hub as `kinp/pk-central-mcp`.

```bash
npm run deploy   # bumps patch version in package.json, builds TS, builds & pushes Docker image
```

The production `docker-compose.yml` references the published image and accepts the same environment variables as the local setup.
