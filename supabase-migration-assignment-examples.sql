-- Run this in Supabase SQL Editor if you need to add assignment_example_overrides

create table if not exists assignment_example_overrides (
  period_index int not null check (period_index >= 0 and period_index <= 7),
  item_index int not null check (item_index >= 0 and item_index <= 9),
  title text,
  topic text,
  primary key (period_index, item_index)
);
