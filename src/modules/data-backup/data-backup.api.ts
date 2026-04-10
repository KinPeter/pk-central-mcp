import { apiFetch } from '../../api-client.js';

export async function sendDataBackupEmail(): Promise<string> {
  const res = await apiFetch<{ message: string }>('/data-backup/email');
  return res.message;
}
