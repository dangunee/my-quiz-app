-- Run this in Supabase SQL Editor if app_analytics already exists
-- to add source_type, source_media, country, region columns

alter table app_analytics add column if not exists source_type text;
alter table app_analytics add column if not exists source_media text;
alter table app_analytics add column if not exists country text;
alter table app_analytics add column if not exists region text;
alter table app_analytics add column if not exists is_logged_in boolean;

create index if not exists idx_app_analytics_source on app_analytics(source_type);
create index if not exists idx_app_analytics_country on app_analytics(country);
create index if not exists idx_app_analytics_logged_in on app_analytics(is_logged_in);
