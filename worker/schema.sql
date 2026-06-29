CREATE TABLE IF NOT EXISTS avatars (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  name TEXT NOT NULL,
  dir TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  calls INTEGER NOT NULL DEFAULT 0,
  adopt INTEGER NOT NULL DEFAULT 0,
  tags_json TEXT NOT NULL DEFAULT '[]',
  emoji TEXT NOT NULL DEFAULT '✍️',
  color TEXT NOT NULL DEFAULT '#6366F1',
  motto TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '状态良好',
  intro TEXT NOT NULL DEFAULT '',
  method TEXT NOT NULL DEFAULT '',
  avoid TEXT NOT NULL DEFAULT '',
  representative_works_json TEXT NOT NULL DEFAULT '[]',
  style_weights_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_avatars_creator_id_created_at
  ON avatars (creator_id, created_at DESC);

CREATE TABLE IF NOT EXISTS avatar_calibrations (
  id TEXT PRIMARY KEY,
  avatar_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  scores_json TEXT NOT NULL DEFAULT '{}',
  answers_json TEXT NOT NULL DEFAULT '{}',
  parameter_changes_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  FOREIGN KEY (avatar_id) REFERENCES avatars(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_avatar_calibrations_avatar_id_created_at
  ON avatar_calibrations (avatar_id, created_at DESC);

CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'done',
  color TEXT NOT NULL DEFAULT '#4F46E5',
  tags_json TEXT NOT NULL DEFAULT '[]',
  seed INTEGER NOT NULL DEFAULT 23,
  steps_done INTEGER NOT NULL DEFAULT 4,
  progress REAL NOT NULL DEFAULT 1,
  desc TEXT NOT NULL DEFAULT '',
  plays INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  completion INTEGER NOT NULL DEFAULT 0,
  earnings REAL NOT NULL DEFAULT 0,
  duration TEXT NOT NULL DEFAULT '3:38',
  audio_url TEXT NOT NULL DEFAULT '',
  generation_source TEXT NOT NULL DEFAULT '',
  final_prompt TEXT NOT NULL DEFAULT '',
  lyrics TEXT NOT NULL DEFAULT '',
  protocol TEXT NOT NULL DEFAULT '',
  contributions_json TEXT NOT NULL DEFAULT '[]',
  project_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_works_creator_id_created_at
  ON works (creator_id, created_at DESC);
