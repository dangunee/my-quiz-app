# Q&A (kotae) データベース

Q&A タブのリスト・本文をブログではなく Supabase の `qna_posts` テーブルから取得します。

## テーブル

- **qna_posts**: `id` (BIGINT), `title`, `content` (HTML), `url` (任意), `sort_order`
- マイグレーション: `supabase/migrations/20250227_qna_posts.sql`

## 表示時の除去

API で本文を返す際、**「........」（4つ以上のドット）以降**（ミリネ韓国語教室ホームページ 以降）を自動で除去して返します。DB には全文を保存して構いません。

## データ投入

1. Supabase SQL Editor で上記マイグレーションを実行
2. ブログまたは既存ソースから `id`, `title`, `content`, `url`, `sort_order` を用意
3. `INSERT INTO qna_posts (id, title, content, url, sort_order) VALUES (...)` で投入

既存のブログ投稿 ID をそのまま `id` に使うと、元の `?p=123` 形式の URL と揃えられます。
