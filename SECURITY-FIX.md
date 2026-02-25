# Supabase 보안 취약점 해결 가이드

Security Advisor에서 5개 오류가 감지된 경우 아래 순서대로 진행하세요.

## 1단계: Supabase Dashboard 접속

1. [supabase.com](https://supabase.com) 로그인
2. **mirinae's Quiz Project** (ID: qoagmarsvytdqliwomlb) 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

## 2단계: RLS 마이그레이션 실행

1. **New query** 클릭
2. `supabase-migration-rls-security.sql` 파일 내용 전체 복사
3. SQL Editor에 붙여넣기
4. **Run** (또는 Ctrl/Cmd + Enter) 실행

## 3단계: 결과 확인

1. 왼쪽 메뉴 **Database** → **Policies** 이동
2. 각 테이블에 RLS 정책이 적용되었는지 확인
3. **Security Advisor** (또는 이메일)에서 경고가 사라졌는지 확인

## 적용되는 테이블

| 테이블 | 적용 내용 |
|--------|----------|
| explanation_overrides | RLS 활성화, service_role만 접근 |
| essay_submissions | RLS 활성화, 사용자 본인 데이터 + service_role |
| app_analytics | RLS 활성화, service_role만 접근 |
| assignment_example_overrides | RLS 활성화, service_role만 접근 |
| writing_assignments | (존재 시) RLS 활성화 |

## 문제 발생 시

- **"relation does not exist"** 오류: 해당 테이블이 없는 경우, 해당 블록만 제거하고 다시 실행
- **"policy already exists"** 오류: `DROP POLICY IF EXISTS`가 먼저 실행되므로 정상적으로 덮어씀
- 추가 문의: Supabase [support team](https://supabase.com/support) 또는 [docs](https://supabase.com/docs)
