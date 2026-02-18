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

-- ========== Writing (作文トレーニング) ==========
create table if not exists writing_assignments (
  id uuid primary key default gen_random_uuid(),
  title_ko text not null,
  title_ja text,
  description text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists writing_periods (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references writing_assignments(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  created_at timestamptz default now()
);

create table if not exists writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_id uuid references writing_periods(id) on delete cascade,
  assignment_id uuid references writing_assignments(id) on delete cascade,
  content text not null,
  feedback text,
  submitted_at timestamptz default now(),
  feedback_at timestamptz
);

create index if not exists idx_writing_submissions_user on writing_submissions(user_id);
create index if not exists idx_writing_submissions_period on writing_submissions(period_id);
create index if not exists idx_writing_submissions_assignment on writing_submissions(assignment_id);

-- ========== App Analytics (퀴즈/Q&A 접속 분석) ==========
create table if not exists app_analytics (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  referrer text,
  referrer_domain text,
  app_type text not null check (app_type in ('quiz', 'kotae')),
  quiz_viewed boolean default false,
  kotae_viewed boolean default false,
  started_at timestamptz not null default now(),
  duration_seconds int,
  created_at timestamptz default now()
);

create index if not exists idx_app_analytics_session on app_analytics(session_id);
create index if not exists idx_app_analytics_started on app_analytics(started_at);
create index if not exists idx_app_analytics_referrer on app_analytics(referrer_domain);
