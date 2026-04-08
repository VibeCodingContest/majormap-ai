# Git 협업 워크플로우

KIT 바이브코딩 공모전 팀(성혁, 준하) 2인 협업 기준으로 작성된 Git 운영 규칙이다.

---

## 브랜치 전략

```
main
 ├── feat/scoring-logic        # 기능 개발
 ├── feat/intake-form-ui
 ├── docs/demo-script          # 문서 작업
 ├── docs/readme-update
 └── hotfix/explain-fallback   # 긴급 수정
```

| 브랜치 | 규칙 |
|---|---|
| `main` | 항상 배포 가능한 상태 유지. 직접 push 금지 |
| `feat/*` | 기능 단위 개발. 완료 후 PR → main |
| `docs/*` | 문서 작업 전용 |
| `hotfix/*` | 데모 직전 긴급 수정 시에만 사용 |

---

## 커밋 메시지 규칙

```
<타입>: <한 줄 요약>
```

| 타입 | 사용 시점 |
|---|---|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 작성/수정 |
| `refactor` | 기능 변경 없는 코드 정리 |
| `style` | Tailwind 등 UI 수정 |
| `chore` | 설정 파일, 의존성 변경 |

**예시**

```
feat: IntakeForm 체크박스 + 데모 프로필 버튼 추가
fix: 복수전공 없음 선택 시 undefined 처리 오류 수정
docs: DEMO_SCRIPT.md 시나리오 A/B/C 작성
refactor: scoring.ts 분리 및 recommendation.ts 리팩터
```

---

## PR 규칙

1. `main`에 직접 push하지 않는다.
2. 작업 완료 후 feature 브랜치에서 PR을 생성한다.
3. 상대방이 1회 리뷰 후 merge한다.
4. PR 제목은 커밋 메시지 규칙과 동일하게 작성한다.
5. 충돌이 생기면 feature 브랜치에서 `main`을 merge한 뒤 해결한다.

---

## CODEOWNERS 권고

```
# /components/ → 준하
/components/   @junha

# /lib/ /app/api/ → 성혁
/lib/          @seonghyeok
/app/api/      @seonghyeok

# /docs/ → 둘 다
/docs/         @seonghyeok @junha
```

실제 `.github/CODEOWNERS` 파일로 등록하면 PR 생성 시 자동 리뷰어 지정이 가능하다.

---

## 제출 직전 동결 절차

1. 마지막 기능 merge 완료 확인
2. `npm run build` 성공 확인
3. 데모 시나리오 A/B/C 직접 클릭 테스트
4. `.env.local`이 `.gitignore`에 포함되어 있는지 확인
5. GitHub main 브랜치 보호 규칙 활성화
   - Settings → Branches → Branch protection rules → `main` 추가
   - "Require a pull request before merging" 체크
   - "Restrict who can push to matching branches" 체크
6. 공모전 제출 마감 이후 커밋 금지

---

## 라벨 체계 (GitHub Issue/PR 라벨)

| 라벨 | 용도 |
|---|---|
| `feature` | 새 기능 |
| `bug` | 버그 |
| `docs` | 문서 |
| `demo` | 데모 관련 |
| `refactor` | 리팩터링 |
| `blocked` | 다른 작업 대기 중 |
| `urgent` | 데모 직전 긴급 처리 |
