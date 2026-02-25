-- Run in Supabase SQL Editor to add writing visibility (기수/회차 공개일 설정)
create table if not exists writing_visibility (
  period_index int not null check (period_index >= 0 and period_index <= 7),
  item_index int not null check (item_index >= 0 and item_index <= 9),
  visible_from timestamptz,
  primary key (period_index, item_index)
);

-- RLS: service_role only
alter table writing_visibility enable row level security;
create policy "Service role full access" on writing_visibility for all using (auth.role() = 'service_role');
