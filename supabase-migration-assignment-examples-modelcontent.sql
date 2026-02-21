-- Run this in Supabase SQL Editor to add modelContent columns to assignment_example_overrides

alter table assignment_example_overrides add column if not exists course_info text;
alter table assignment_example_overrides add column if not exists theme text;
alter table assignment_example_overrides add column if not exists question text;
alter table assignment_example_overrides add column if not exists grammar_note text;
alter table assignment_example_overrides add column if not exists patterns jsonb;
