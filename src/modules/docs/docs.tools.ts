import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  listDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from './docs.api.js';

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

  server.registerTool(
    'create-document',
    {
      description:
        'Create a new document. Documents are markdown-formatted texts, commonly used for recipes and other notes. Expect documents to be in Hungarian language.',
      inputSchema: {
        title: z.string().describe('The document title'),
        content: z.string().describe('The document content in markdown format'),
        tags: z
          .array(z.string())
          .optional()
          .describe('Optional tags to categorize the document (e.g. "recipe", "tech")'),
      },
    },
    async ({ title, content, tags }) => {
      const doc = await createDocument({ title, content, tags });

      return {
        content: [
          {
            type: 'text',
            text: `Document created successfully.\nID: ${doc.id}\nTitle: ${doc.title}${doc.tags.length ? `\nTags: ${doc.tags.join(', ')}` : ''}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'update-document',
    {
      description:
        "Update an existing document by its ID. Replaces the title, content, and tags. Fetch the document first with 'get-document' if you need to preserve existing content.",
      inputSchema: {
        id: z.string().describe('The document ID to update'),
        title: z.string().describe('The new document title'),
        content: z.string().describe('The new document content in markdown format'),
        tags: z
          .array(z.string())
          .optional()
          .describe('Optional tags to categorize the document (e.g. "recipe", "tech")'),
      },
    },
    async ({ id, title, content, tags }) => {
      const doc = await updateDocument(id, { title, content, tags });

      return {
        content: [
          {
            type: 'text',
            text: `Document updated successfully.\nID: ${doc.id}\nTitle: ${doc.title}${doc.tags.length ? `\nTags: ${doc.tags.join(', ')}` : ''}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'delete-document',
    {
      description:
        'Permanently delete a document by its ID. This action cannot be undone. Always confirm with the user before deleting a document.',
      inputSchema: {
        id: z.string().describe('The document ID to delete'),
      },
    },
    async ({ id }) => {
      await deleteDocument(id);

      return {
        content: [{ type: 'text', text: `Document ${id} deleted successfully.` }],
      };
    },
  );
}
