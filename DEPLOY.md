# GitHub 배포 가이드

이 프로젝트는 **GitHub**에 푸시하면 **Vercel**이 자동으로 배포합니다.

---

## 1. 배포 흐름

```
로컬 변경 → git commit → git push origin main → GitHub → Vercel 자동 배포
```

---

## 2. 배포 실행 방법

### 터미널에서 실행

```bash
# 1. 프로젝트 디렉터리로 이동
cd /Users/dangunee/Desktop/my-quiz-app

# 2. 변경 사항 확인
git status

# 3. 변경 파일 스테이징
git add .

# 4. 커밋
git commit -m "커밋 메시지"

# 5. GitHub에 푸시 (이 시점에서 Vercel 자동 배포 시작)
git push origin main
```

### 한 줄로 실행

```bash
cd /Users/dangunee/Desktop/my-quiz-app && git add . && git status
# 확인 후
git commit -m "변경 내용" && git push origin main
```

---

## 3. GitHub 저장소 설정

- **저장소**: https://github.com/dangunee/my-quiz-app
- **기본 브랜치**: `main`
- **원격 이름**: `origin`

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
3. **Import Git Repository** → GitHub에서 `dangunee/my-quiz-app` 선택
4. **Deploy** 클릭

이후 `main` 브랜치에 푸시할 때마다 자동 배포됩니다.

---

## 5. Supabase 설정 (音読 音声 파일)

音読 과제 음성 제출을 사용하려면:

1. **SQL 실행**: `supabase-migration-ondoku-audio.sql` 실행 (audio_url 컬럼 추가)
2. **Storage 버킷 생성**: Supabase Dashboard → Storage → New bucket
   - Name: `ondoku-audio`
   - Public bucket: ON

---

## 6. 환경 변수 (Vercel)

Vercel 프로젝트 → **Settings** → **Environment Variables**:

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | 권장 |
| `ADMIN_SECRET` | 관리자 로그인 비밀키 | ✅ |

---

## 7. 커스텀 도메인

Vercel → **Settings** → **Domains**에서 추가:

- `quiz.mirinae.jp`
- `writing.mirinae.jp`
- `ondoku.mirinae.jp`

---

## 8. 배포 확인

- GitHub: https://github.com/dangunee/my-quiz-app/commits/main
- Vercel: 프로젝트 대시보드 → **Deployments** 탭

---

## 9. 로컬 빌드 테스트

```bash
npm run build
npm run start
```
