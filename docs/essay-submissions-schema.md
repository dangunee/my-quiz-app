# 作文提出 DB 설계

## 요구사항
- **누가**: 학생(user_id)
- **언제**: 제출일시(submitted_at)
- **몇기 몇번째**: period_index(1期=0, 2期=1...), item_index(第1回=0, 第2回=1...)
- **첨삭**: 에디터에서 원문 수정(corrected_content) + 코멘트(feedback)
- **완료**: status로 未添削/添削中/完了 구분

## 새 스키마

### essay_submissions (作文提出)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| period_index | int | 0=1期, 1=2期, 2=3期... (0-7) |
| item_index | int | 0=第1回, 1=第2回... (0-9) |
| content | text | 학생 제출 원문 |
| feedback | text | 강사 코멘트(添削) |
| corrected_content | text | 강사가 수정한 원문 (에디터에서 직접 수정) |
| status | text | 'pending'=未添削, 'in_progress'=添削中, 'completed'=完了 |
| submitted_at | timestamptz | 제출일시 |
| feedback_at | timestamptz | 첨삭 저장일시 |
| completed_at | timestamptz | 完了 처리일시 |

과제 제목은 `PERIOD_EXAMPLES[period_index][item_index].title` 또는 `assignment_example_overrides`에서 조회.

## 예시 (1기 3명, 2기 3명, 3기 2명, 각 第1回)

| user | period_index | item_index | status |
|------|--------------|------------|--------|
| A | 0 (1期) | 0 (第1回) | pending |
| B | 0 (1期) | 0 (第1回) | pending |
| C | 0 (1期) | 0 (第1回) | completed |
| D | 1 (2期) | 0 (第1回) | in_progress |
| ... | ... | ... | ... |

## 관리자 화면 흐름
1. 목록: `{기}期 第{N}回 · {학생명} · {제출일} · {status 뱃지}`
2. 클릭 → 에디터 모달: content(읽기) + corrected_content(편집) + feedback(입력)
3. 저장 → feedback, corrected_content 저장, status='in_progress'
4. 完了 버튼 → status='completed', completed_at 저장
