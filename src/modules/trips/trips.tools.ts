import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getTripsStats } from './trips.api.js';

export function registerTripsTools(server: McpServer): void {
  server.registerTool(
    'get-trips-stats',
    {
      description:
        'Get aggregated travel statistics for the user, including flight counts, distances, airlines, airports, routes, cabin classes, and visit counts. Optionally filter by year(s) or specific flight/visit IDs. When both year and IDs are provided, only the year filters will be applied.',
      inputSchema: {
        year: z
          .array(z.string().regex(/^\d{4}$/, 'Must be a 4-digit year, e.g. "2024"'))
          .optional()
          .describe('Filter stats to one or more years, e.g. ["2023", "2024"]'),
        flightIds: z.array(z.string()).optional().describe('Filter stats to specific flight IDs'),
        visitIds: z.array(z.string()).optional().describe('Filter stats to specific visit IDs'),
      },
    },
    async ({ year, flightIds, visitIds }) => {
      const stats = await getTripsStats({ year, flightIds, visitIds });
      return { content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }] };
    },
  );
}
