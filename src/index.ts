import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { Request, Response } from 'express';
import { registerDocsTools } from './modules/docs/docs.tools.js';
import { bearerAuth } from './http-auth.js';

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'pk-central',
    version: '1.0.0',
  });
  registerDocsTools(server);
  return server;
}

// --- Start server ---
async function main() {
  const transport = process.env.MCP_TRANSPORT === 'http' ? 'http' : 'stdio';

  if (transport === 'http') {
    const port = parseInt(process.env.MCP_PORT ?? '4999', 10);
    const host = process.env.MCP_HOST ?? '0.0.0.0';
    const app = createMcpExpressApp({ host });

    app.post('/mcp', bearerAuth, async (req: Request, res: Response) => {
      const method = req.body?.method ?? 'unknown';
      const ip = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'unknown';
      console.log(`[${new Date().toISOString()}] ${method} from ${ip}`);

      const httpTransport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      const server = createMcpServer();
      await server.connect(httpTransport);
      await httpTransport.handleRequest(req, res, req.body);
      res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] ${method} → ${res.statusCode}`);
        httpTransport.close();
      });
    });

    app.listen(port, host, () => {
      console.log(`pk-central mcp server running on http (${host}:${port})`);
    });
  } else {
    const server = createMcpServer();
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    console.error('pk-central mcp server running on stdio');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
