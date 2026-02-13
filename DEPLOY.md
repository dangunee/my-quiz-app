# Lolipop 배포 가이드

## 1. 정적 파일 빌드

```bash
cd /Users/dangunee/Desktop/my-quiz-app
npm run build
```

빌드가 완료되면 **`out`** 폴더가 생성됩니다.

---

## 2. Lolipop에 업로드

### 방법 A: 서브폴더 (예: mirinae.jp/quiz/)

1. Lolipop의 **ファイルマネージャー** 또는 **FTP** 접속
2. `out` 폴더 **안의 모든 파일**을 업로드
   - 업로드 위치: `quiz` 폴더 생성 후 그 안에
   - 예: `public_html/quiz/` 에 index.html, _next/ 폴더 등

3. **basePath 설정** 필요 시 `next.config.ts`에 추가:
   ```ts
   const nextConfig: NextConfig = {
     output: "export",
     basePath: "/quiz",  // mirinae.jp/quiz/ 로 접속할 때
   };
   ```
4. basePath 변경 후 **다시 빌드** 후 업로드

### 방법 B: 서브도메인 (예: quiz.mirinae.jp)

1. Lolipop 관리자에서 **サブドメイン** 설정
2. 서브도메인용 폴더(예: `quiz.mirinae.jp` 또는 `quiz`)에 `out` 폴더 내용 업로드
3. basePath 없이 사용 가능

---

## 3. 업로드할 파일/폴더

`out` 폴더 전체 내용:
```
out/
├── index.html
├── 404.html
└── _next/
    ├── static/
    └── ...
```

**주의**: `_next` 폴더와 `index.html` 등 **모든 파일**을 누락 없이 업로드하세요.

---

## 4. 접속 확인

- 서브폴더: `https://mirinae.jp/quiz/`
- 서브도메인: `https://quiz.mirinae.jp/`

---

## 대안: Vercel 무료 배포 (Node.js 지원)

Lolipop 대신 [Vercel](https://vercel.com)에 배포하면:

- Node.js/Next.js 완전 지원
- 무료 플랜
- GitHub 연동 시 자동 배포
- `output: "export"` 제거 후 일반 Next.js로 배포 가능

Vercel 배포 시 `next.config.ts`에서 `output: "export"`를 제거하면 됩니다.
