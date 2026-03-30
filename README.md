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

| Script          | Description                             |
| --------------- | --------------------------------------- |
| `npm run build` | Compile TypeScript to `dist/`           |
| `npm run dev`   | Watch mode — recompiles on file changes |
| `npm run start` | Run the compiled server                 |

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
