import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { listDocuments, getDocumentById } from './docs.api.js';

export function registerDocsTools(server: McpServer) {
  server.registerTool(
    'list-documents',
    {
      description:
        "List all documents. Use this to browse available documents and get their IDs before fetching full content. Important: most of the recipes are stored as documents. Expect documents to be in Hungarian language. The documents may have tags that indicate their content, such as 'recipe', 'greek', 'tech', etc.",
      inputSchema: {},
    },
    async () => {
      const docs = await listDocuments();

      if (docs.length === 0) {
        return {
          content: [{ type: 'text', text: 'No documents found.' }],
        };
      }

      const lines = docs.map(
        (d) =>
          `- ID: ${d.id} | Title: ${d.title}${d.tags.length ? ` | Tags: ${d.tags.join(', ')}` : ''}`,
      );

      return {
        content: [
          {
            type: 'text',
            text: `Found ${docs.length} document(s):\n${lines.join('\n')}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'get-document',
    {
      description:
        "Fetch the full content of a document by its ID. The document content is markdown-formatted text. Important: recipes are stored as documents, so you can use this tool to fetch the full recipe content after listing documents with the 'list-documents' tool. Expect documents to be in Hungarian language. Display the document content as it is as markdown text, without any translation or modification - unless explicitly requested.",
      inputSchema: {
        id: z.string().describe('The document ID to fetch'),
      },
    },
    async ({ id }) => {
      const doc = await getDocumentById(id);

      return {
        content: [
          {
            type: 'text',
            text: [
              `# ${doc.title}`,
              doc.tags.length ? `Tags: ${doc.tags.join(', ')}` : '',
              '',
              doc.content,
            ]
              .filter(Boolean)
              .join('\n'),
          },
        ],
      };
    },
  );
}
