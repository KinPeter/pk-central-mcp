import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { listNotes, createNote, updateNote, deleteNote, Note } from './notes.api.js';

function formatNote(n: Note) {
  const lines = [`- ID: ${n.id} | Created: ${n.createdAt}`];
  if (n.pinned) lines[0] += ' | [PINNED]';
  if (n.archived) lines[0] += ' | [ARCHIVED]';
  if (n.text) lines.push(`  Text: ${n.text}`);
  if (n.links.length) {
    lines.push(`  Links: ${n.links.map((l) => `${l.name} (${l.url})`).join(', ')}`);
  }
  return lines.join('\n');
}

const linkSchema = z.object({
  name: z.string().describe('Display name for the link'),
  url: z.string().url().describe('URL of the link'),
});

export function registerNotesTools(server: McpServer) {
  server.registerTool(
    'list-notes',
    {
      description:
        'List all notes for the user. Notes can contain text and/or links, and may be pinned or archived. The text content of the notes is limited to 1000 characters and is plain text that is not formatted but can include new line characters. Use this tool to get an overview of existing notes and their IDs before creating, updating or deleting notes.',
      inputSchema: {},
    },
    async () => {
      const notes = await listNotes();

      if (notes.length === 0) {
        return { content: [{ type: 'text', text: 'No notes found.' }] };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Found ${notes.length} note(s):\n${notes.map(formatNote).join('\n')}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'create-note',
    {
      description:
        'Create a new note. A note can have text, a list of links, and pinned/archived flags. Both the text and the links are optional, but at least one of them should be provided. The text content of the notes is limited to 1000 characters and is plain text that is not formatted but can include new line characters which should be properly saved.',
      inputSchema: {
        text: z.string().max(1000).optional().describe('Optional text content of the note'),
        links: z.array(linkSchema).optional().describe('Optional list of links to attach'),
        pinned: z
          .boolean()
          .optional()
          .describe('Whether the note should be pinned (default: false)'),
        archived: z
          .boolean()
          .optional()
          .describe('Whether the note should be archived (default: false)'),
      },
    },
    async ({ text, links, pinned, archived }) => {
      const note = await createNote({ text, links, pinned, archived });

      return {
        content: [{ type: 'text', text: `Note created successfully.\n${formatNote(note)}` }],
      };
    },
  );

  server.registerTool(
    'update-note',
    {
      description:
        'Update an existing note by its ID. Replaces all fields. The text content of the notes is limited to 1000 characters and is plain text that is not formatted but can include new line characters. When updating a note, you need to provide all the fields that you want to keep, as the update will replace the existing content.',
      inputSchema: {
        id: z.string().describe('The note ID to update'),
        text: z.string().max(1000).optional().describe('Optional text content of the note'),
        links: z.array(linkSchema).optional().describe('Optional list of links to attach'),
        pinned: z.boolean().optional().describe('Whether the note should be pinned'),
        archived: z.boolean().optional().describe('Whether the note should be archived'),
      },
    },
    async ({ id, text, links, pinned, archived }) => {
      const note = await updateNote(id, { text, links, pinned, archived });

      return {
        content: [{ type: 'text', text: `Note updated successfully.\n${formatNote(note)}` }],
      };
    },
  );

  server.registerTool(
    'delete-note',
    {
      description:
        'Permanently delete a note by its ID. This action cannot be undone, always ask for confirmation before proceeding.',
      inputSchema: {
        id: z.string().describe('The note ID to delete'),
      },
    },
    async ({ id }) => {
      await deleteNote(id);

      return {
        content: [{ type: 'text', text: `Note ${id} deleted successfully.` }],
      };
    },
  );
}
