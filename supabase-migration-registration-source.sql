-- Add registration_source to customer_profiles (QUIZ or WRITING)
-- Run in Supabase SQL Editor

alter table customer_profiles add column if not exists registration_source text check (registration_source in ('QUIZ', 'WRITING'));
