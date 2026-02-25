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

-- ========== Essay Submissions (作文提出: 期+第何回 기반)
create table if not exists essay_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_index int not null check (period_index >= 0 and period_index <= 7),
  item_index int not null check (item_index >= 0 and item_index <= 9),
  content text not null,
  feedback text,
  corrected_content text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  submitted_at timestamptz not null default now(),
  feedback_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_essay_submissions_user on essay_submissions(user_id);
create index if not exists idx_essay_submissions_period_item on essay_submissions(period_index, item_index);
create index if not exists idx_essay_submissions_status on essay_submissions(status);
create index if not exists idx_essay_submissions_submitted on essay_submissions(submitted_at desc);
create unique index if not exists idx_essay_submissions_user_period_item on essay_submissions(user_id, period_index, item_index);

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

-- ========== Assignment Example Overrides (課題例 1期~8期) ==========
create table if not exists assignment_example_overrides (
  period_index int not null check (period_index >= 0 and period_index <= 7),
  item_index int not null check (item_index >= 0 and item_index <= 9),
  title text,
  topic text,
  primary key (period_index, item_index)
);

-- ========== Customer Profiles (고객 데이터) ==========
create table if not exists customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  region text,
  plan_type text check (plan_type in ('無料', '有料')),
  course_type text check (course_type in ('作文', '音読')),
  payment_status text check (payment_status is null or payment_status in ('有', '無')),
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

-- ========== 生活韓国語 (Seikatsu Korean) ==========
create table if not exists seikatsu_items (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  sort_order int not null default 0,
  created_at timestamptz default now()
);
create index if not exists idx_seikatsu_items_sort on seikatsu_items(sort_order desc);
alter table seikatsu_items enable row level security;
create policy "Public read seikatsu" on seikatsu_items for select using (true);
create policy "Service role full seikatsu" on seikatsu_items for all using (auth.role() = 'service_role');
