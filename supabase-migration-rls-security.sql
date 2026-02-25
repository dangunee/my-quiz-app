-- Supabase Security Advisor 대응: RLS(Row Level Security) 적용
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- 5개 취약점 해결용

-- 1. explanation_overrides: RLS 활성화 (service_role만 API 경유 접근)
ALTER TABLE explanation_overrides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON explanation_overrides;
CREATE POLICY "Service role full access" ON explanation_overrides
  FOR ALL USING (auth.role() = 'service_role');

-- 2. essay_submissions: RLS 활성화
ALTER TABLE essay_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own essay submissions" ON essay_submissions;
DROP POLICY IF EXISTS "Users can insert own essay submissions" ON essay_submissions;
DROP POLICY IF EXISTS "Users can update own essay submissions" ON essay_submissions;
DROP POLICY IF EXISTS "Service role full access" ON essay_submissions;
CREATE POLICY "Users can view own essay submissions" ON essay_submissions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own essay submissions" ON essay_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own essay submissions" ON essay_submissions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON essay_submissions
  FOR ALL USING (auth.role() = 'service_role');

-- 3. app_analytics: RLS 활성화 (service_role만 접근)
ALTER TABLE app_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON app_analytics;
CREATE POLICY "Service role full access" ON app_analytics
  FOR ALL USING (auth.role() = 'service_role');

-- 4. assignment_example_overrides: RLS 활성화
ALTER TABLE assignment_example_overrides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON assignment_example_overrides;
CREATE POLICY "Service role full access" ON assignment_example_overrides
  FOR ALL USING (auth.role() = 'service_role');

-- 5. writing_assignments: 테이블 존재 시 RLS 적용
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'writing_assignments') THEN
    EXECUTE 'ALTER TABLE writing_assignments ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Service role full access" ON writing_assignments';
    EXECUTE 'CREATE POLICY "Service role full access" ON writing_assignments FOR ALL USING (auth.role() = ''service_role'')';
  END IF;
END $$;
