# 고객 로그인 API 설정

## 환경 변수

Vercel에 이미 Supabase 설정이 있다면 추가 설정 없이 동작합니다.
`SUPABASE_SERVICE_ROLE_KEY` 또는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 필요합니다.

## Supabase Auth 설정

1. Supabase 대시보드 → **Authentication** → **Providers**
2. **Email**이 활성화되어 있는지 확인
3. (선택) **Authentication** → **Settings** → **Email Auth**  
   - 이메일 인증 비활성화: "Confirm email" 끄면 가입 후 바로 로그인 가능

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
