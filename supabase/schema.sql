create table if not exists public.musegrid_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.musegrid_snapshots enable row level security;

drop policy if exists "Users can read own MuseGrid snapshot" on public.musegrid_snapshots;
create policy "Users can read own MuseGrid snapshot"
  on public.musegrid_snapshots
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own MuseGrid snapshot" on public.musegrid_snapshots;
create policy "Users can insert own MuseGrid snapshot"
  on public.musegrid_snapshots
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own MuseGrid snapshot" on public.musegrid_snapshots;
create policy "Users can update own MuseGrid snapshot"
  on public.musegrid_snapshots
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
