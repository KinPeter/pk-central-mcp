import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  listVisits,
  createVisit,
  updateVisit,
  deleteVisit,
  queryVisits,
  Visit,
} from './visits.api.js';

function formatVisit(v: Visit) {
  return `- ID: ${v.id} | ${v.city}, ${v.country}${v.year ? ` (${v.year})` : ''} | Coords: ${v.lat}, ${v.lng}`;
}

const visitInputSchema = {
  city: z.string().describe('City name'),
  country: z.string().describe('Country name'),
  lat: z.number().min(-90).max(90).describe('Latitude'),
  lng: z.number().min(-180).max(180).describe('Longitude'),
  year: z
    .string()
    .regex(/^\d{4}$/)
    .optional()
    .describe('Optional year of the visit (e.g. "2024")'),
};

export function registerVisitsTools(server: McpServer) {
  server.registerTool(
    'list-visits',
    {
      description: 'List all visited places saved for the user.',
      inputSchema: {},
    },
    async () => {
      const visits = await listVisits();

      if (visits.length === 0) {
        return { content: [{ type: 'text', text: 'No visits found.' }] };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Found ${visits.length} visit(s):\n${visits.map(formatVisit).join('\n')}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'create-visit',
    {
      description: 'Create a new visited place entry.',
      inputSchema: visitInputSchema,
    },
    async ({ city, country, lat, lng, year }) => {
      const visit = await createVisit({ city, country, lat, lng, year });

      return {
        content: [
          {
            type: 'text',
            text: `Visit created successfully.\n${formatVisit(visit)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'update-visit',
    {
      description:
        'Update an existing visit entry by its ID. Replaces all fields, fetch and find the visit first with "list-visits" if you need to preserve existing content.',
      inputSchema: {
        id: z.string().describe('The visit ID to update'),
        ...visitInputSchema,
      },
    },
    async ({ id, city, country, lat, lng, year }) => {
      const visit = await updateVisit(id, { city, country, lat, lng, year });

      return {
        content: [
          {
            type: 'text',
            text: `Visit updated successfully.\n${formatVisit(visit)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'delete-visit',
    {
      description:
        'Permanently delete a visit entry by its ID. This action cannot be undone, always ask for confirmation before proceeding.',
      inputSchema: {
        id: z.string().describe('The visit ID to delete'),
      },
    },
    async ({ id }) => {
      await deleteVisit(id);

      return {
        content: [{ type: 'text', text: `Visit ${id} deleted successfully.` }],
      };
    },
  );

  server.registerTool(
    'query-visits',
    {
      description:
        'Query visited places with optional filters. Returns visits matching all provided filters. If no filters are provided, returns all visits.',
      inputSchema: {
        year: z
          .array(z.string().regex(/^\d{4}$/))
          .optional()
          .describe('Filter by one or more years, e.g. ["2024"] or ["2023", "2024"]'),
        country: z
          .array(z.string())
          .optional()
          .describe('Filter by one or more country names, e.g. ["France"] or ["Korea", "Japan"]'),
      },
    },
    async ({ year, country }) => {
      const visits = await queryVisits({ year, country });

      if (visits.length === 0) {
        return { content: [{ type: 'text', text: 'No visits found matching the query.' }] };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Found ${visits.length} visit(s):\n${visits.map(formatVisit).join('\n')}`,
          },
        ],
      };
    },
  );
}
