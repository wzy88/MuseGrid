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
