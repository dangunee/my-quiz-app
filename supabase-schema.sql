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
  source_type text,
  source_media text,
  country text,
  region text,
  is_logged_in boolean,
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
create index if not exists idx_app_analytics_source on app_analytics(source_type);
create index if not exists idx_app_analytics_country on app_analytics(country);
create index if not exists idx_app_analytics_logged_in on app_analytics(is_logged_in);

-- If table already exists, run this to add new columns:
-- alter table app_analytics add column if not exists source_type text;
-- alter table app_analytics add column if not exists source_media text;
-- alter table app_analytics add column if not exists country text;
-- alter table app_analytics add column if not exists region text;
-- alter table app_analytics add column if not exists is_logged_in boolean;

-- ========== Customer Profiles (고객 데이터) ==========
create table if not exists customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  region text,
  plan_type text check (plan_type in ('無料', '有料')),
  course_type text check (course_type in ('作文', '音読', '無')),
  payment_status text check (payment_status in ('未定', '完了')),
  period int check (period >= 1 and period <= 8),
  course_interval text check (course_interval in ('1週', '2週')),
  start_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_customer_profiles_region on customer_profiles(region);
create index if not exists idx_customer_profiles_plan_type on customer_profiles(plan_type);

-- RLS: customers can read own profile
alter table customer_profiles enable row level security;
create policy "Users can read own profile" on customer_profiles for select using (auth.uid() = user_id);
create policy "Service role full access" on customer_profiles for all using (auth.role() = 'service_role');
