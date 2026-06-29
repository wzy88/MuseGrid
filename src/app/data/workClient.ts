import { type GeneratedWork, type ProjectBrief } from '../state/mockProject';

function apiBase() {
  return (import.meta.env.VITE_MUSEGRID_API_BASE as string | undefined)?.replace(/\/$/, '').trim();
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = apiBase();
  if (!base) {
    throw new Error('未配置作品 API');
  }
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const data = await response.json() as T & { ok?: boolean; error?: string };
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `作品 API 返回 ${response.status}`);
  }
  return data;
}

export function hasWorkApi() {
  return Boolean(apiBase());
}

export async function saveCloudWork(creatorId: string, work: GeneratedWork, project: ProjectBrief): Promise<GeneratedWork> {
  const data = await requestJson<{ ok: boolean; work: GeneratedWork }>('/api/works', {
    method: 'POST',
    body: JSON.stringify({
      creatorId,
      ...work,
      project,
    }),
  });
  return data.work;
}

export async function fetchCloudWorks(creatorId: string): Promise<GeneratedWork[]> {
  const data = await requestJson<{ ok: boolean; works: GeneratedWork[] }>(`/api/works?creatorId=${encodeURIComponent(creatorId)}`);
  return data.works;
}

export async function fetchCloudWork(workId: string): Promise<GeneratedWork> {
  const data = await requestJson<{ ok: boolean; work: GeneratedWork }>(`/api/works/${encodeURIComponent(workId)}`);
  return data.work;
}
