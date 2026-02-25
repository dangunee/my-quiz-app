-- 학생별 공개일 설정 (기수/회차별 학생 개별 공개일)
create table if not exists writing_visibility_student (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_index int not null check (period_index >= 0 and period_index <= 7),
  item_index int not null check (item_index >= 0 and item_index <= 9),
  visible_from timestamptz,
  primary key (user_id, period_index, item_index)
);

create index if not exists idx_writing_visibility_student_user on writing_visibility_student(user_id);
create index if not exists idx_writing_visibility_student_period on writing_visibility_student(period_index, item_index);

alter table writing_visibility_student enable row level security;
create policy "Service role full access" on writing_visibility_student for all using (auth.role() = 'service_role');
