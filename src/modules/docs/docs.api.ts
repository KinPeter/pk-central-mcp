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

export interface DocumentRequest {
  title: string;
  tags?: string[];
  content: string;
}

export async function createDocument(data: DocumentRequest): Promise<Document> {
  return apiFetch<Document>('/docs/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDocument(id: string, data: DocumentRequest): Promise<Document> {
  return apiFetch<Document>(`/docs/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteDocument(id: string): Promise<void> {
  await apiFetch<{ id: string }>(`/docs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
