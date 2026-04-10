import { apiFetch } from '../../api-client.js';

export interface Birthday {
  id: string;
  name: string;
  date: string;
}

export interface BirthdayRequest {
  name: string;
  date: string;
}

export async function listBirthdays(): Promise<Birthday[]> {
  const res = await apiFetch<{ entities: Birthday[] }>('/birthdays/');
  return res.entities;
}

export async function createBirthday(data: BirthdayRequest): Promise<Birthday> {
  return apiFetch<Birthday>('/birthdays/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBirthday(id: string, data: BirthdayRequest): Promise<Birthday> {
  return apiFetch<Birthday>(`/birthdays/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBirthday(id: string): Promise<void> {
  await apiFetch<{ id: string }>(`/birthdays/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
