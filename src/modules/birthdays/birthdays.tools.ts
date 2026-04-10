import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { listBirthdays, createBirthday, updateBirthday, deleteBirthday } from './birthdays.api.js';

// Date format: M/D or MM/DD (e.g. "3/15" or "03/15")
const DATE_PATTERN = /^(1[0-2]|0?[1-9])\/(3[01]|[12][0-9]|0?[1-9])$/;

export function registerBirthdaysTools(server: McpServer) {
  server.registerTool(
    'list-birthdays',
    {
      description: 'List all birthdays saved for the user.',
      inputSchema: {},
    },
    async () => {
      const birthdays = await listBirthdays();

      if (birthdays.length === 0) {
        return { content: [{ type: 'text', text: 'No birthdays found.' }] };
      }

      const lines = birthdays.map((b) => `- ID: ${b.id} | Name: ${b.name} | Date: ${b.date}`);

      return {
        content: [
          {
            type: 'text',
            text: `Found ${birthdays.length} birthday(s):\n${lines.join('\n')}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'create-birthday',
    {
      description: 'Create a new birthday entry.',
      inputSchema: {
        name: z.string().describe("The person's name"),
        date: z
          .string()
          .regex(DATE_PATTERN)
          .describe(
            'Birthday date in M/D or MM/DD format (e.g. "3/15" or "03/15"), without the year',
          ),
      },
    },
    async ({ name, date }) => {
      const birthday = await createBirthday({ name, date });

      return {
        content: [
          {
            type: 'text',
            text: `Birthday created successfully.\n- ID: ${birthday.id} | Name: ${birthday.name} | Date: ${birthday.date}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'update-birthday',
    {
      description: 'Update an existing birthday entry by its ID.',
      inputSchema: {
        id: z.string().describe('The birthday entry ID to update'),
        name: z.string().describe("The person's name"),
        date: z
          .string()
          .regex(DATE_PATTERN)
          .describe(
            'Birthday date in M/D or MM/DD format (e.g. "3/15" or "03/15"), without the year',
          ),
      },
    },
    async ({ id, name, date }) => {
      const birthday = await updateBirthday(id, { name, date });

      return {
        content: [
          {
            type: 'text',
            text: `Birthday updated successfully.\n- ID: ${birthday.id} | Name: ${birthday.name} | Date: ${birthday.date}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'delete-birthday',
    {
      description: 'Permanently delete a birthday entry by its ID. This action cannot be undone.',
      inputSchema: {
        id: z.string().describe('The birthday entry ID to delete'),
      },
    },
    async ({ id }) => {
      await deleteBirthday(id);

      return {
        content: [{ type: 'text', text: `Birthday ${id} deleted successfully.` }],
      };
    },
  );
}
