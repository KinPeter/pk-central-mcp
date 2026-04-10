import { apiFetch } from '../../api-client.js';

export interface PersonalData {
  id: string;
  name: string;
  identifier: string;
  expiry?: string | null;
}

export interface PersonalDataRequest {
  name: string;
  identifier: string;
  expiry?: string | null;
}

export async function listPersonalData(): Promise<PersonalData[]> {
  const res = await apiFetch<{ entities: PersonalData[] }>('/personal-data/');
  return res.entities;
}

export async function createPersonalData(data: PersonalDataRequest): Promise<PersonalData> {
  return apiFetch<PersonalData>('/personal-data/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePersonalData(
  id: string,
  data: PersonalDataRequest,
): Promise<PersonalData> {
  return apiFetch<PersonalData>(`/personal-data/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePersonalData(id: string): Promise<void> {
  await apiFetch<{ id: string }>(`/personal-data/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
