import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import {
  DEFAULT_PROJECT,
  SAMPLE_WORKS,
  createSteps,
  type ContributionSnapshot,
  type GeneratedWork,
  type ProjectBrief,
  type StepState,
} from '../state/mockProject';

export type MuseGridUser = {
  id: string;
  email: string;
  name: string;
  isDemo: boolean;
};

export type MuseGridSnapshot = {
  project: ProjectBrief;
  steps: StepState[];
  currentStep: number;
  contributions: ContributionSnapshot[];
  works: GeneratedWork[];
  activeWorkId: number | null;
  updatedAt: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type MuseGridStore = {
  mode: 'local' | 'supabase';
  getCurrentUser(): Promise<MuseGridUser | null>;
  signIn(credentials: AuthCredentials): Promise<MuseGridUser>;
  signOut(): Promise<void>;
  loadSnapshot(userId?: string): Promise<MuseGridSnapshot>;
  saveSnapshot(snapshot: MuseGridSnapshot, userId?: string): Promise<void>;
};

const STORAGE_KEY = 'musegrid.v2.snapshot';
const LOCAL_USER_KEY = 'musegrid.v2.localUser';
const LOCAL_USER: MuseGridUser = {
  id: 'local-demo-user',
  email: 'demo@musegrid.local',
  name: '梦之主',
  isDemo: true,
};

export function createDefaultSnapshot(): MuseGridSnapshot {
  return {
    project: DEFAULT_PROJECT,
    steps: createSteps(true),
    currentStep: 0,
    contributions: [],
    works: SAMPLE_WORKS,
    activeWorkId: null,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeSnapshot(value: unknown): MuseGridSnapshot {
  const fallback = createDefaultSnapshot();
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const partial = value as Partial<MuseGridSnapshot>;
  return {
    project: partial.project ?? fallback.project,
    steps: partial.steps ?? fallback.steps,
    currentStep: typeof partial.currentStep === 'number' ? partial.currentStep : fallback.currentStep,
    contributions: partial.contributions ?? fallback.contributions,
    works: partial.works && partial.works.length > 0 ? partial.works : fallback.works,
    activeWorkId: partial.activeWorkId ?? fallback.activeWorkId,
    updatedAt: partial.updatedAt ?? fallback.updatedAt,
  };
}

function browserStorage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function createLocalStore(): MuseGridStore {
  return {
    mode: 'local',
    async getCurrentUser() {
      const storage = browserStorage();
      if (!storage) return LOCAL_USER;
      const raw = storage.getItem(LOCAL_USER_KEY);
      return raw ? JSON.parse(raw) as MuseGridUser : LOCAL_USER;
    },
    async signIn(credentials) {
      const user: MuseGridUser = {
        id: `local-${credentials.email.trim().toLowerCase() || 'demo'}`,
        email: credentials.email.trim().toLowerCase() || LOCAL_USER.email,
        name: credentials.email.split('@')[0] || LOCAL_USER.name,
        isDemo: true,
      };
      browserStorage()?.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      return user;
    },
    async signOut() {
      browserStorage()?.removeItem(LOCAL_USER_KEY);
    },
    async loadSnapshot() {
      const raw = browserStorage()?.getItem(STORAGE_KEY);
      if (!raw) return createDefaultSnapshot();
      try {
        return normalizeSnapshot(JSON.parse(raw));
      } catch {
        return createDefaultSnapshot();
      }
    },
    async saveSnapshot(snapshot) {
      browserStorage()?.setItem(STORAGE_KEY, JSON.stringify({
        ...snapshot,
        updatedAt: new Date().toISOString(),
      }));
    },
  };
}

function env(name: string) {
  return (import.meta.env[name] as string | undefined)?.trim();
}

function mapUser(user: User): MuseGridUser {
  return {
    id: user.id,
    email: user.email ?? 'unknown@musegrid.local',
    name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? '创作者',
    isDemo: false,
  };
}

export function createSupabaseStore(client: SupabaseClient): MuseGridStore {
  return {
    mode: 'supabase',
    async getCurrentUser() {
      const { data } = await client.auth.getUser();
      return data.user ? mapUser(data.user) : null;
    },
    async signIn(credentials) {
      const { data, error } = await client.auth.signInWithPassword(credentials);
      if (error) throw error;
      if (!data.user) throw new Error('登录成功但没有返回用户信息');
      return mapUser(data.user);
    },
    async signOut() {
      await client.auth.signOut();
    },
    async loadSnapshot(userId) {
      if (!userId) return createDefaultSnapshot();
      const { data, error } = await client
        .from('musegrid_snapshots')
        .select('snapshot')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return normalizeSnapshot(data?.snapshot);
    },
    async saveSnapshot(snapshot, userId) {
      if (!userId) return;
      const { error } = await client
        .from('musegrid_snapshots')
        .upsert({
          user_id: userId,
          snapshot: {
            ...snapshot,
            updatedAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      if (error) throw error;
    },
  };
}

export function createMuseGridStore(): MuseGridStore {
  const url = env('VITE_SUPABASE_URL');
  const anonKey = env('VITE_SUPABASE_ANON_KEY');
  if (!url || !anonKey) {
    return createLocalStore();
  }
  return createSupabaseStore(createClient(url, anonKey));
}
