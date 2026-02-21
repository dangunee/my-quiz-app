-- Add writing_approved to customer_profiles for MY PAGE access control
-- Run in Supabase SQL Editor

alter table customer_profiles add column if not exists writing_approved boolean default false;

comment on column customer_profiles.writing_approved is 'true = user can see MY PAGE (作文提出)';
