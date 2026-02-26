-- Run this in Supabase SQL Editor to add model_essay column

alter table assignment_example_overrides add column if not exists model_essay text;
