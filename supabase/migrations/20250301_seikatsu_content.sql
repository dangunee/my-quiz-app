-- 生活韓国語: 本文明文・URL・ブログ投稿IDを保存（본문도 DB에 저장, 강좌 안내는 상단만 저장）
-- Run: Supabase SQL Editor or supabase db push

ALTER TABLE seikatsu_items
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS wp_id BIGINT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_seikatsu_items_wp_id ON seikatsu_items(wp_id) WHERE wp_id IS NOT NULL;

COMMENT ON COLUMN seikatsu_items.content IS '本文HTML。講座案内の場合は開講日程・時間・特徴行より下は保存しない';
COMMENT ON COLUMN seikatsu_items.url IS 'ブログ記事URL';
COMMENT ON COLUMN seikatsu_items.wp_id IS 'WordPress post ID (?p=xxx)';
