-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
create table if not exists explanation_overrides (
  quiz_id int primary key,
  explanation text not null,
  japanese text,
  options jsonb,
  updated_at timestamptz default now()
);

-- If table already exists, run this to add new columns:
-- alter table explanation_overrides add column if not exists japanese text;
-- alter table explanation_overrides add column if not exists options jsonb;
