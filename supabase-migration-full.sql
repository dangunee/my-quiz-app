-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
create table if not exists explanation_overrides (
  quiz_id int primary key,
  explanation text not null,
  updated_at timestamptz default now()
);
alter table explanation_overrides add column if not exists japanese text;
alter table explanation_overrides add column if not exists options jsonb;

-- App Analytics (퀴즈/Q&A 접속 분석)
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

alter table app_analytics add column if not exists source_type text;
alter table app_analytics add column if not exists source_media text;
alter table app_analytics add column if not exists country text;
alter table app_analytics add column if not exists region text;
alter table app_analytics add column if not exists is_logged_in boolean;
create index if not exists idx_app_analytics_logged_in on app_analytics(is_logged_in);

-- Customer Profiles (고객 데이터)
create table if not exists customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  region text,
  plan_type text check (plan_type in ('無料', '有料')),
  course_type text check (course_type is null or course_type in ('作文', '音読')),
  payment_status text check (payment_status in ('未定', '完了')),
  period int check (period is null or (period >= 1 and period <= 8)),
  course_interval text check (course_interval in ('1週', '2週')),
  start_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_customer_profiles_region on customer_profiles(region);
create index if not exists idx_customer_profiles_plan_type on customer_profiles(plan_type);

alter table customer_profiles enable row level security;
drop policy if exists "Users can read own profile" on customer_profiles;
drop policy if exists "Service role full access" on customer_profiles;
create policy "Users can read own profile" on customer_profiles for select using (auth.uid() = user_id);
create policy "Service role full access" on customer_profiles for all using (auth.role() = 'service_role');

-- Migration: course_type에서 '無' 제거 (기존 DB용, 테이블이 이미 있을 때)
update customer_profiles set course_type = null where course_type = '無';
alter table customer_profiles drop constraint if exists customer_profiles_course_type_check;
alter table customer_profiles add constraint customer_profiles_course_type_check
  check (course_type is null or course_type in ('作文', '音読'));
