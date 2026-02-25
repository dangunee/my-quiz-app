-- 音読 PDF メール予約送信用テーブル
-- Run: supabase db push or execute this SQL in Supabase SQL Editor
-- Vercel Cron (vercel.json) runs /api/cron/send-scheduled-ondoku-emails every 5 min
-- Set CRON_SECRET in Vercel env for cron auth
CREATE TABLE IF NOT EXISTS scheduled_ondoku_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "to" TEXT NOT NULL,
  body TEXT,
  feedback_json JSONB NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_scheduled_ondoku_emails_scheduled_at ON scheduled_ondoku_emails(scheduled_at) WHERE status = 'pending';
