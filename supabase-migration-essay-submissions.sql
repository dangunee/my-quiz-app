-- 作文提出: 期(period_index) + 第何回(item_index) 기반, 첨삭 완료 상태 지원
-- 기존 writing_* 테이블을 새 구조로 교체

-- 1. 기존 테이블 삭제 (데이터 손실 주의)
DROP TABLE IF EXISTS writing_submissions;
DROP TABLE IF EXISTS writing_periods;
DROP TABLE IF EXISTS writing_assignments;

-- 2. 새 essay_submissions 테이블 생성
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

-- unique: 한 학생이 같은 기 같은 회차에 한 번만 제출 (재제출 시 update)
create unique index if not exists idx_essay_submissions_user_period_item 
  on essay_submissions(user_id, period_index, item_index);
