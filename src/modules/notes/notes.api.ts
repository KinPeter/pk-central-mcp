import { apiFetch } from '../../api-client.js';

export interface Link {
  name: string;
  url: string;
}

export interface Note {
  id: string;
  createdAt: string;
  text?: string | null;
  links: Link[];
  archived: boolean;
  pinned: boolean;
}

export interface NoteRequest {
  text?: string | null;
  links?: Link[];
  archived?: boolean;
  pinned?: boolean;
}

export async function listNotes(): Promise<Note[]> {
  const res = await apiFetch<{ entities: Note[] }>('/notes/');
  return res.entities;
}

export async function createNote(data: NoteRequest): Promise<Note> {
  return apiFetch<Note>('/notes/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateNote(id: string, data: NoteRequest): Promise<Note> {
  return apiFetch<Note>(`/notes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteNote(id: string): Promise<void> {
  await apiFetch<{ id: string }>(`/notes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
