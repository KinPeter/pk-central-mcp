import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { sendDataBackupEmail } from './data-backup.api.js';

export function registerDataBackupTools(server: McpServer) {
  server.registerTool(
    'send-data-backup-email',
    {
      description:
        'Trigger a full data backup on the server and send the backup to the user via email.',
      inputSchema: {},
    },
    async () => {
      const message = await sendDataBackupEmail();

      return {
        content: [{ type: 'text', text: message }],
      };
    },
  );
}
