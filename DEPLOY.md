# GitHub 배포 가이드

이 프로젝트는 **GitHub**에 푸시하면 **Vercel**이 자동으로 배포됩니다.

---

## 1. 배포 흐름

```
로컬 변경 → git add → git commit → git push origin main → Vercel 자동 배포
```

---

## 2. 배포 실행 방법

### 기본 순서

```bash
# 1. 프로젝트 디렉터리로 이동
cd /Users/dangunee/Desktop/my-quiz-app

# 2. 변경 사항 확인
git status

# 3. 변경 파일 스테이징
git add .

# 4. 커밋
git commit -m "변경 내용 요약"

# 5. GitHub에 푸시 (Vercel 자동 배포 시작)
git push origin main
```

### 한 줄로 실행

```bash
cd /Users/dangunee/Desktop/my-quiz-app && git add . && git status
# 확인 후
git commit -m "변경 내용" && git push origin main
```

---

## 3. GitHub 저장소

| 항목 | 값 |
|------|-----|
| 저장소 | https://github.com/dangunee/my-quiz-app |
| 기본 브랜치 | `main` |
| 원격 이름 | `origin` |

### 원격 확인

```bash
git remote -v
# origin  https://github.com/dangunee/my-quiz-app.git (fetch)
# origin  https://github.com/dangunee/my-quiz-app.git (push)
```

---

## 4. Vercel 연동 (최초 1회)

1. [vercel.com](https://vercel.com) 로그인
2. **Add New** → **Project**
3. **Import Git Repository** → `dangunee/my-quiz-app` 선택
4. **Deploy** 클릭

이후 `main` 브랜치에 푸시할 때마다 자동 배포됩니다.

---

## 5. 환경 변수 (Vercel)

Vercel 프로젝트 → **Settings** → **Environment Variables**:

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | 권장 |
| `ADMIN_SECRET` | 관리자 로그인 비밀키 | ✅ |
| `RESEND_API_KEY` | Resend API Key (音読 메일 전송용) | 音読 메일 전송 시 |
| `RESEND_FROM` | 발신 메일 주소 (예: noreply@mirinae.jp) | 선택 |

---

## 6. Supabase 설정

### 音読 음성 제출

1. **SQL 실행**: `supabase-migration-ondoku-audio.sql` (audio_url 컬럼 추가)
2. **Storage 버킷**: Supabase Dashboard → Storage → New bucket
   - Name: `ondoku-audio`
   - Public bucket: ON

---

## 7. 커스텀 도메인

Vercel → **Settings** → **Domains**:

- `quiz.mirinae.jp`
- `writing.mirinae.jp`
- `ondoku.mirinae.jp`

---

## 8. 배포 확인

- **GitHub**: https://github.com/dangunee/my-quiz-app/commits/main
- **Vercel**: 프로젝트 대시보드 → **Deployments** 탭

---

## 9. 로컬 빌드 테스트

```bash
npm install
npm run build
npm run start
```

빌드 성공 후 `npm run start`로 로컬에서 프로덕션 모드 확인 가능합니다.
