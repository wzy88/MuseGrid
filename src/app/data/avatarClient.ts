import { AVATARS, normalizeAvatar, type AvatarCalibration, type AvatarProfile } from '../state/mockProject';

export type CreateAvatarInput = {
  creatorId: string;
  name: string;
  dir: string;
  tags: string[];
  strengths?: string[];
  motto: string;
  intro?: string;
  method?: string;
  avoid?: string;
  representativeWorks?: string[];
  emoji?: string;
  color?: string;
};

export type CreateCalibrationInput = {
  creatorId: string;
  scores: Record<string, string>;
  answers: Record<string, string>;
};

const CREATOR_ID_KEY = 'musegrid.v2.creatorId';

function apiBase() {
  return (import.meta.env.VITE_MUSEGRID_API_BASE as string | undefined)?.replace(/\/$/, '').trim();
}

function storage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function getCreatorId() {
  const store = storage();
  if (!store) return 'creator-server';
  const existing = store.getItem(CREATOR_ID_KEY);
  if (existing) return existing;
  const next = `creator_${crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(16).slice(2)}`}`;
  store.setItem(CREATOR_ID_KEY, next);
  return next;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = apiBase();
  if (!base) {
    throw new Error('未配置分身 API');
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
    throw new Error(data.error || `分身 API 返回 ${response.status}`);
  }
  return data;
}

export async function fetchCloudAvatars(creatorId: string): Promise<AvatarProfile[]> {
  const data = await requestJson<{ ok: boolean; avatars: AvatarProfile[] }>(`/api/avatars?creatorId=${encodeURIComponent(creatorId)}`);
  return data.avatars.map(normalizeAvatar);
}

export async function createCloudAvatar(input: CreateAvatarInput): Promise<AvatarProfile> {
  const data = await requestJson<{ ok: boolean; avatar: AvatarProfile }>('/api/avatars', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return normalizeAvatar(data.avatar);
}

export async function createCloudCalibration(avatarId: string | number, input: CreateCalibrationInput): Promise<{ avatar: AvatarProfile; calibration: AvatarCalibration }> {
  const data = await requestJson<{ ok: boolean; avatar: AvatarProfile; calibration: AvatarCalibration }>(`/api/avatars/${avatarId}/calibrations`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return {
    avatar: normalizeAvatar(data.avatar),
    calibration: data.calibration,
  };
}

export function createLocalAvatar(input: CreateAvatarInput): AvatarProfile {
  const fallbackColor = input.dir === '作曲' ? '#2563EB' : input.dir === '编曲' ? '#059669' : input.dir === '制作' ? '#D97706' : '#6366F1';
  const fallbackEmoji = input.dir === '作曲' ? '🎼' : input.dir === '编曲' ? '🎸' : input.dir === '制作' ? '🎚️' : '✍️';
  const weights: Record<string, number> = {};
  [...input.tags, ...(input.strengths || [])].forEach((tag, index) => {
    weights[tag] = Math.max(0.48, 0.72 - index * 0.04);
  });
  return normalizeAvatar({
    id: `local_avatar_${Date.now()}`,
    creatorId: input.creatorId,
    name: input.name || '未命名分身',
    dir: input.dir || '作词',
    lv: 1,
    level: 1,
    calls: 0,
    adopt: 0,
    tags: input.tags,
    emoji: input.emoji || fallbackEmoji,
    color: input.color || fallbackColor,
    motto: input.motto || '先找到情绪转折点，再让作品说话。',
    status: '本地保存',
    intro: input.intro || '',
    method: input.method || '',
    avoid: input.avoid || '',
    representativeWorks: input.representativeWorks || [],
    styleWeights: weights,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export function seedAvatars() {
  return AVATARS.map(normalizeAvatar);
}
