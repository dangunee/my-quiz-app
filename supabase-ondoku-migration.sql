-- 音読トレーニング用テーブル・カラム追加
-- Supabase SQL Editorで実行してください

-- ondoku_submissions テーブル作成
CREATE TABLE IF NOT EXISTS ondoku_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_index INTEGER NOT NULL CHECK (period_index >= 0 AND period_index <= 7),
  item_index INTEGER NOT NULL CHECK (item_index >= 0 AND item_index <= 9),
  content TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  feedback TEXT,
  corrected_content TEXT,
  feedback_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, period_index, item_index)
);

-- RLS有効化
ALTER TABLE ondoku_submissions ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のレコードのみ閲覧・挿入・更新可能
CREATE POLICY "Users can view own ondoku submissions"
  ON ondoku_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ondoku submissions"
  ON ondoku_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ondoku submissions"
  ON ondoku_submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- customer_profiles に ondoku_approved カラム追加（存在しない場合）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customer_profiles' AND column_name = 'ondoku_approved'
  ) THEN
    ALTER TABLE customer_profiles ADD COLUMN ondoku_approved BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
