# 데스크톱 my-quiz-app → GitHub 푸시

원격은 이미 설정됨: `origin` = https://github.com/dangunee/my-quiz-app.git

## 1. 변경사항 커밋 후 푸시 (일반적인 경우)

터미널에서 **아래를 순서대로** 실행하세요.

```bash
cd /Users/dangunee/Desktop/my-quiz-app

# 변경·추가된 파일 모두 스테이징
git add -A

# 커밋 (메시지는 원하는 대로 수정 가능)
git commit -m "Update quiz app: API, QuizClient, seikatsu, migrations"

# 원격과 맞춘 뒤 푸시
git pull origin main --rebase
git push origin main
```

---

## 2. 원격이 랜딩 페이지만 있어서 덮어써야 하는 경우

예전에 `quiz-mirinae`에서 푸시해서 GitHub에 Next.js 앱이 아니라 랜딩 페이지만 있는 상태라면, **데스크톱 버전으로 덮어쓰기**할 때만 아래를 사용하세요. (원격의 그 내용은 사라집니다.)

```bash
cd /Users/dangunee/Desktop/my-quiz-app
git add -A
git commit -m "Restore full Next.js quiz app from Desktop"
git push origin main --force
```

---

## 3. 원격 주소만 다시 잡고 싶을 때

```bash
cd /Users/dangunee/Desktop/my-quiz-app
git remote remove origin
git remote add origin https://github.com/dangunee/my-quiz-app.git
git push -u origin main
```
