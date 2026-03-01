-- Q&A (韓国語の微妙なニュアンス) リスト・本文用テーブル
-- 블로그 대신 DB에서 리스트/본문 제공. 본문은 「........」以降（ミリネ韓国語教室ホームページ 以降）をAPIで除去して返す
-- Run: supabase db push or execute in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS qna_posts (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qna_posts_sort ON qna_posts(sort_order ASC, id ASC);

COMMENT ON TABLE qna_posts IS 'Q&A list and body. Content is stripped after ........ (footer) when served via API.';

ALTER TABLE qna_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON qna_posts FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON qna_posts FOR ALL USING (auth.role() = 'service_role');
