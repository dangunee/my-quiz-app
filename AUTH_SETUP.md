# 고객 로그인 API 설정

## 환경 변수

Vercel에 이미 Supabase 설정이 있다면 추가 설정 없이 동작합니다.
`SUPABASE_SERVICE_ROLE_KEY` 또는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 필요합니다.

(선택) `NEXT_PUBLIC_SITE_URL`: 배포 URL (예: `https://quiz.mirinae.jp`). 이메일 확인 리다이렉트용.

## Supabase Auth 설정

1. Supabase 대시보드 → **Authentication** → **Providers**
2. **Email**이 활성화되어 있는지 확인
3. **Authentication** → **URL Configuration** (중요!)
   - **Site URL**: `https://quiz.mirinae.jp` (실제 배포 URL로 설정)
   - **Redirect URLs**에 추가: `https://quiz.mirinae.jp/login`, `https://quiz.mirinae.jp/**`
   - 이메일 확인 링크가 이 URL로 연결됩니다. localhost로 설정되어 있으면 확인 시 연결 오류 발생
4. (선택) **Authentication** → **Settings** → **Email Auth**  
   - 이메일 인증 비활성화: "Confirm email" 끄면 가입 후 바로 로그인 가능
5. **이메일 템플릿 일본어로 변경**: **Authentication** → **Email Templates**

   **Confirm signup (회원가입 확인)**
   - **Subject**: `会員登録の確認`
   - **Body**:

```
会員登録を完了するには、以下のリンクをクリックしてください。

<a href="{{ .ConfirmationURL }}">メールアドレスを確認する</a>

このメールに心当たりがない場合は、無視してください。
```

   **Reset password (패스워드 재설정)**
   - **Subject**: `パスワードの再設定`
   - **Body**:

```
パスワードを再設定するには、以下のリンクをクリックしてください。

<a href="{{ .ConfirmationURL }}">パスワードを再設定する</a>

このメールに心当たりがない場合は、無視してください。
```

## API 엔드포인트

### 회원가입
```
POST /api/auth/register
Content-Type: application/json

{
  "id": "username",      // 로그인용 아이디 (표시용)
  "email": "user@example.com",
  "password": "비밀번호",
  "name": "홍길동"
}
```

### 로그인
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "비밀번호"
}

응답: { user, session: { access_token, refresh_token } }
```

## 페이지

- **/login** – 회원가입 / 로그인 폼
- 로그인 성공 시 토큰은 `localStorage`에 저장되며 퀴즈 페이지로 이동
