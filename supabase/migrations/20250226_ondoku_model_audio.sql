-- 音読課題 模範音声 URL 保存用テーブル
CREATE TABLE IF NOT EXISTS ondoku_model_audio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('chujokyu', 'chuujokyu')),
  period INTEGER NOT NULL CHECK (period >= 0 AND period <= 3),
  type TEXT NOT NULL CHECK (type IN ('fast', 'slow')),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(level, period, type)
);
