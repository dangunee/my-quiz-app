# 배포 가이드

## Vercel 배포 (권장)

Next.js 앱은 Vercel에 배포하는 것이 가장 간단합니다.

### 1. GitHub 연동

1. [vercel.com](https://vercel.com) 로그인
2. **Add New** → **Project**
3. GitHub 저장소 연결 후 `my-quiz-app` 선택
4. **Deploy** 클릭

### 2. 환경 변수 설정

Vercel 프로젝트 → **Settings** → **Environment Variables**에서 추가:

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (비공개) | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key (클라이언트용) | 권장 |
| `ADMIN_SECRET` | 관리자/作文 관리자 로그인 비밀키 | ✅ |
| `STRIPE_SECRET_KEY` | Stripe 결제용 (checkout 사용 시) | 선택 |
| `NEXT_PUBLIC_APP_URL` | 배포 URL (예: `https://quiz.mirinae.jp`) | 선택 |
| `NEXT_PUBLIC_SITE_URL` | 이메일 인증 리다이렉트용 | 선택 |

### 3. Supabase 설정

1. [supabase.com](https://supabase.com) 대시보드
2. **SQL Editor**에서 `supabase-schema.sql` 전체 실행
3. **Authentication** → **URL Configuration**에 배포 URL 추가 (예: `https://quiz.mirinae.jp`)

### 4. 生活韓国語 데이터 초기화

`seikatsu_items` 테이블에 블로그 목록을 넣으려면:

```bash
curl -X POST "https://your-domain.vercel.app/api/admin/sync-seikatsu" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

또는 기존 DB만 사용 중이면 `supabase-migration-seikatsu.sql` 실행 후 위 sync 호출

### 5. 커스텀 도메인

- Vercel 프로젝트 → **Settings** → **Domains**
- `quiz.mirinae.jp`, `writing.mirinae.jp` 추가
- DNS에 Vercel 레코드 설정

**도메인별 동작:**
- `quiz.mirinae.jp` – 퀴즈 메인, `/writing` 접근 시 `writing.mirinae.jp`로 리다이렉트
- `writing.mirinae.jp` – 作文 전용 (루트 = 作文 페이지, `/admin` = 作文 관리자)

---

## 배포 후 확인

- **퀴즈**: `https://your-domain.vercel.app/`
- **作文**: `https://your-domain.vercel.app/writing`
- **관리자**: `https://your-domain.vercel.app/admin`
---

## 로컬 배포 테스트

```bash
npm run build
npm run start
```
