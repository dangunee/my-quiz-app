-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
create table if not exists explanation_overrides (
  quiz_id int primary key,
  explanation text not null,
  updated_at timestamptz default now()
);
