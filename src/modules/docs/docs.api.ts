import { apiFetch } from '../../api-client.js';

export interface DocumentListItem {
  id: string;
  title: string;
  tags: string[];
}

export interface Document extends DocumentListItem {
  content: string;
}

export async function listDocuments(): Promise<DocumentListItem[]> {
  const res = await apiFetch<{ entities: DocumentListItem[] }>('/docs/');
  return res.entities;
}

export async function getDocumentById(id: string): Promise<Document> {
  return apiFetch<Document>(`/docs/${encodeURIComponent(id)}`);
}
