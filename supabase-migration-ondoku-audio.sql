-- 音読課題 音声ファイル対応
-- Supabase SQL Editorで実行してください

-- ondoku_submissions に audio_url カラム追加
ALTER TABLE ondoku_submissions
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Storage バケット作成手順（Supabase Dashboard）:
-- 1. Storage > New bucket
-- 2. Name: ondoku-audio
-- 3. Public bucket: ON（再生・ダウンロード用に公開）
-- 4. Create bucket
--
-- ポリシー: サービスロールでアップロードするため、API経由で追加ポリシー不要。
-- ただし、バケットが存在しないとエラーになる場合は手動で作成してください。
