-- 生活韓国語 목록 (퀴즈앱 DB에 저장)
-- Run in Supabase SQL Editor

create table if not exists seikatsu_items (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_seikatsu_items_sort on seikatsu_items(sort_order desc);

-- RLS: public read
alter table seikatsu_items enable row level security;
create policy "Public read" on seikatsu_items for select using (true);
create policy "Service role full access" on seikatsu_items for all using (auth.role() = 'service_role');
