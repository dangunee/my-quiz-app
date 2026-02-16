# 관리자 API 설정 가이드

관리자가 퀴즈 답변 설명을 수정할 수 있는 API를 사용하려면 Supabase 설정이 필요합니다.

## 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com)에서 로그인 후 새 프로젝트 생성
2. **SQL Editor**에서 `supabase-schema.sql` 내용 실행하여 테이블 생성

## 2. 환경 변수 설정 (Vercel)

Vercel 프로젝트 설정 → Environment Variables에 추가:

| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL (Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (Settings → API, **비공개**) |
| `ADMIN_SECRET` | 관리자 인증용 비밀키 (직접 정한 값) |

## 3. 관리자 페이지 사용

1. `https://quiz.mirinae.jp/admin` 접속
2. `ADMIN_SECRET`에 설정한 값 입력 후 로그인
3. 각 문제의 "수정" 버튼으로 설명 편집 후 "저장"

## API 엔드포인트

- **GET /api/explanations** – 설명 오버라이드 목록 (공개)
- **PUT /api/admin/explanations/[id]** – 설명 수정 (인증 필요)
  - Header: `Authorization: Bearer {ADMIN_SECRET}`
  - Body: `{ "explanation": "수정된 설명 텍스트" }`

## Supabase 미설정 시

환경 변수가 없으면 API는 빈 오버라이드를 반환하며, 퀴즈는 기존 `quiz-data.ts`의 설명을 그대로 사용합니다.
