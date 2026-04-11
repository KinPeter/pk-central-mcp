import { apiFetch } from '../../api-client.js';

export interface Visit {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  year?: string | null;
}

export interface VisitRequest {
  city: string;
  country: string;
  lat: number;
  lng: number;
  year?: string | null;
}

export async function listVisits(): Promise<Visit[]> {
  const res = await apiFetch<{ entities: Visit[] }>('/visits/');
  return res.entities;
}

export async function createVisit(data: VisitRequest): Promise<Visit> {
  return apiFetch<Visit>('/visits/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVisit(id: string, data: VisitRequest): Promise<Visit> {
  return apiFetch<Visit>(`/visits/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteVisit(id: string): Promise<void> {
  await apiFetch<{ id: string }>(`/visits/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export interface VisitQuery {
  year?: string[];
  country?: string[];
}

export async function queryVisits(query: VisitQuery): Promise<Visit[]> {
  const res = await apiFetch<{ entities: Visit[] }>('/visits/query', {
    method: 'POST',
    body: JSON.stringify(query),
  });
  return res.entities;
}
