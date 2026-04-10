import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  listPersonalData,
  createPersonalData,
  updatePersonalData,
  deletePersonalData,
} from './personal-data.api.js';

const EXPIRY_PATTERN = /^([2-9]\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function formatEntry(d: { id: string; name: string; identifier: string; expiry?: string | null }) {
  return `- ID: ${d.id} | Name: ${d.name} | Identifier: ${d.identifier}${d.expiry ? ` | Expiry: ${d.expiry}` : ''}`;
}

export function registerPersonalDataTools(server: McpServer) {
  server.registerTool(
    'list-personal-data',
    {
      description:
        'List all personal data entries for the user. Personal data stores identifiers such as passport numbers, ID card numbers, loyalty card numbers, etc., along with optional expiry dates.',
      inputSchema: {},
    },
    async () => {
      const entries = await listPersonalData();

      if (entries.length === 0) {
        return { content: [{ type: 'text', text: 'No personal data entries found.' }] };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Found ${entries.length} personal data entr${entries.length === 1 ? 'y' : 'ies'}:\n${entries.map(formatEntry).join('\n')}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'create-personal-data',
    {
      description:
        'Create a new personal data entry. Use this to store sensitive identifiers such as passport numbers, ID card numbers, loyalty card numbers, etc.',
      inputSchema: {
        name: z.string().describe('Label for this entry (e.g. "Passport", "Loyalty Card")'),
        identifier: z.string().describe('The actual identifier value (e.g. the document number)'),
        expiry: z
          .string()
          .regex(EXPIRY_PATTERN)
          .optional()
          .describe('Optional expiry date in YYYY-MM-DD format'),
      },
    },
    async ({ name, identifier, expiry }) => {
      const entry = await createPersonalData({ name, identifier, expiry });

      return {
        content: [
          {
            type: 'text',
            text: `Personal data entry created successfully.\n${formatEntry(entry)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'update-personal-data',
    {
      description: 'Update an existing personal data entry by its ID.',
      inputSchema: {
        id: z.string().describe('The personal data entry ID to update'),
        name: z.string().describe('Label for this entry (e.g. "Passport", "Loyalty Card")'),
        identifier: z.string().describe('The actual identifier value (e.g. the document number)'),
        expiry: z
          .string()
          .regex(EXPIRY_PATTERN)
          .optional()
          .describe('Optional expiry date in YYYY-MM-DD format'),
      },
    },
    async ({ id, name, identifier, expiry }) => {
      const entry = await updatePersonalData(id, { name, identifier, expiry });

      return {
        content: [
          {
            type: 'text',
            text: `Personal data entry updated successfully.\n${formatEntry(entry)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'delete-personal-data',
    {
      description:
        'Permanently delete a personal data entry by its ID. This action cannot be undone. Always confirm with the user before deleting a personal data entry.',
      inputSchema: {
        id: z.string().describe('The personal data entry ID to delete'),
      },
    },
    async ({ id }) => {
      await deletePersonalData(id);

      return {
        content: [{ type: 'text', text: `Personal data entry ${id} deleted successfully.` }],
      };
    },
  );
}
