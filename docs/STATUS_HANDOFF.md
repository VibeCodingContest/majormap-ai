# STATUS HANDOFF

작성일: 2026-04-07  
작성자: Cursor AI Agent (테크리드 역할)  
목적: 현재 작업 상태를 다른 AI에게 정확히 인계

---

## 현재 브랜치

**Git 저장소 없음.**  
`c:\VibeCoding_Test\초기설계안\` 디렉터리에 `.git`이 존재하지 않는다.  
`git status` 실행 결과: `fatal: not a git repository`  
→ 브랜치 없음, 커밋 이력 없음, stage 개념 없음.

---

## 최근 커밋

**커밋 없음.** Git 미초기화 상태이므로 커밋 이력이 존재하지 않는다.

대신 파일 수정 타임스탬프 기준 작업 이력 (모두 2026-04-07):

| 시각 | 작업 |
|---|---|
| 09:58 | `lib/types.ts` 타입 확장 |
| 09:59 | `lib/sample-data.ts` 데이터 보강 |
| 09:59 | `lib/scoring.ts` 신규 생성 |
| 10:00 | `lib/recommendation.ts` 리팩터 |
| 10:00 | `components/IntakeForm.tsx` 전면 교체 |
| 10:00 | `components/RoadmapPanel.tsx` 신규 생성 |
| 10:01 | `components/ResultCard.tsx` 개선 |
| 10:01 | `lib/llm.ts` 신규 생성 |
| 10:01 | `app/api/explain/route.ts` 신규 생성 |
| 10:02 | `app/api/recommend/route.ts` 개선 |
| 10:02 | `.env.example` 신규 생성 |
| 10:12 | `README.md` 대폭 개선 |
| 10:13 | `docs/DEMO_SCRIPT.md` 신규 생성 |
| 10:13 | `docs/GIT_WORKFLOW.md` 신규 생성 |
| 10:14 | `docs/PROMPT_LOG_TEMPLATE.md` 신규 생성 |
| 10:14 | `docs/AI_COLLAB.md` 보강 |

---

## 변경 파일 요약

### 신규 생성 (오늘 AI 세션에서 추가됨)

| 파일 | 크기 | 핵심 변경점 |
|---|---|---|
| `lib/scoring.ts` | 2.8KB | `calcScore()` — 필수/선택 태그 점수, 키워드 보너스(+8), 복수전공 보너스(+10), 0~100 정규화. `buildReasons()` — 추천 이유 문장 생성 |
| `lib/llm.ts` | 4.3KB | OpenAI GPT-4o-mini 호출. `OPENAI_API_KEY` 없으면 `buildFallback()` 자동 반환. `buildPrompt()` — 구조화 데이터만 활용, 없는 정보 생성 금지 지시 |
| `app/api/explain/route.ts` | 0.7KB | POST `/api/explain`. `recommendation + profile` 필드 유효성 검사. `generateExplanation()` 호출 후 JSON 반환 |
| `components/RoadmapPanel.tsx` | 2.2KB | `ExplainResponse` 표시 컴포넌트. `headline`, `fitSummary`, `evidence[]`, `caution`, `roadmap[]` 3단계 렌더링 |
| `.env.example` | 177B | `OPENAI_API_KEY=sk-...` 안내, "절대 커밋 금지" 주석 포함 |
| `docs/DEMO_SCRIPT.md` | 3.8KB | 시나리오 A/B/C 단계별 클릭 스크립트, 기대 결과(점수/진로명) 명시 |
| `docs/GIT_WORKFLOW.md` | 2.7KB | 브랜치 전략, 커밋 규칙, PR 규칙, CODEOWNERS 권고, 제출 직전 동결 절차 |
| `docs/PROMPT_LOG_TEMPLATE.md` | 3.1KB | AI 협업 로그 양식 + 작성 예시 |

### 수정 (기존 파일 대폭 변경)

| 파일 | 이전 → 이후 | 핵심 변경점 |
|---|---|---|
| `lib/types.ts` | 35줄 → 72줄 | `ScoreBreakdown` 타입 추가. `CareerRecommendation`에 `scoreBreakdown`, `reasons`, `summary` 필드 추가. `DemoProfile`, `ExplainRequest`, `ExplainResponse`, `RoadmapPhase` 신규 |
| `lib/sample-data.ts` | 74줄 → 170줄 | 과목 5개 → 15개(2023/2024 트랙 분리). 진로 3개 → 4개(솔루션 컨설턴트 추가). `demoProfiles[3]` 추가. `courseMap`, `careerMap`, `skillTagLabels` 헬퍼 추가 |
| `lib/recommendation.ts` | 35줄 → 45줄 | `calcScore()`, `buildReasons()` 활용 리팩터. `satisfies CareerRecommendation` 타입 안정성. 상위 3개만 반환 |
| `app/api/recommend/route.ts` | 17줄 → 23줄 | `StudentProfile` 타입 명시. 입력 검증 (`Array.isArray` 체크). try/catch 에러 핸들링 추가 |
| `components/IntakeForm.tsx` | 64줄 → 254줄 | 과목 ID 텍스트 입력 → select + 체크박스 + 데모 프로필 버튼 A/B/C. `any` 제거, `CareerRecommendation[]` 타입 적용. 학번/전공 변경 시 체크박스 자동 초기화 |
| `components/ResultCard.tsx` | 12줄 → 190줄 | ID 텍스트 노출 → 한국어 이름 배지. `scoreBreakdown` 4칸 표. 보유/부족 역량 컬러 배지. "AI 해설 보기" 버튼 + `RoadmapPanel` 연동 |
| `README.md` | 27줄 → 80줄 | 한 줄 정의, 문제 정의, MVP 범위 표, 기술 구조 트리, 실행 방법, 환경변수 표, 데모 요약 |
| `docs/AI_COLLAB.md` | 16줄 → 60줄 | AI 작업 파일 전체 표, 사람 검토 항목, AI 한계 vs 사람 판단 비교 표, 실제 작업 로그 |

### 미수정 (원본 유지)

| 파일 | 내용 |
|---|---|
| `app/page.tsx` | 홈 랜딩 (`/recommend` 링크 버튼만 있음) |
| `app/recommend/page.tsx` | `<IntakeForm />` 렌더링만 함 |
| `docs/PLAN.md` | 문제 정의 초안 |
| `docs/PROJECT_SCOPE.md` | MVP 포함/제외 범위 |
| `docs/TASKS.md` | **모든 체크박스 `[ ]` 미완료 상태** — 업데이트 필요 |
| `prompts/PROMPT_FOR_PRO.md` | 프롬프트 참고용 문서 |

---

## 구현 완료된 기능

| 기능 | 파일 | 상태 |
|---|---|---|
| 학번/전공 select 입력 | `components/IntakeForm.tsx` | 완료 |
| 과목 체크박스 (학번/전공 필터링) | `components/IntakeForm.tsx` | 완료 |
| 데모 프로필 버튼 A/B/C | `components/IntakeForm.tsx` | 완료 |
| 관심 키워드 입력 | `components/IntakeForm.tsx` | 완료 |
| 규칙 기반 진로 추천 (상위 3개) | `lib/recommendation.ts` | 완료 |
| 5요소 점수 계산 (필수/선택/키워드/복수전공 보너스/정규화) | `lib/scoring.ts` | 완료 |
| 추천 API POST `/api/recommend` | `app/api/recommend/route.ts` | 완료 |
| 결과 카드 (점수, 역량, 과목명, 추천 이유) | `components/ResultCard.tsx` | 완료 |
| AI 해설 API POST `/api/explain` | `app/api/explain/route.ts` | 완료 |
| OpenAI 호출 + fallback 자동 전환 | `lib/llm.ts` | 완료 |
| AI 로드맵 패널 | `components/RoadmapPanel.tsx` | 완료 |
| 진로 4개 데이터 (솔루션 컨설턴트 포함) | `lib/sample-data.ts` | 완료 |
| 과목 15개 데이터 (2023/2024 트랙 분리) | `lib/sample-data.ts` | 완료 |
| 데모 프로필 3개 | `lib/sample-data.ts` | 완료 |
| 공모전 제출 문서 5종 | `README.md`, `docs/*.md` | 완료 |

---

## 미완성 기능

| 항목 | 이유 | 우선순위 |
|---|---|---|
| `.gitignore` 없음 | 아직 미생성. API 키 노출 위험 | **즉시** |
| `package.json` 없음 | Next.js 프로젝트 미초기화. `npm install`, `npm run dev` 불가 | **즉시** |
| `next.config.js`, `tsconfig.json`, `tailwind.config.js` 없음 | 위와 동일 | **즉시** |
| `ResultCard.tsx` — API 에러 응답 미처리 | `res.ok` 확인 없이 `setExplainData(data)` 호출. 500 응답 시 `RoadmapPanel`에 에러 객체가 넘어가 UI 깨짐 가능 | 높음 |
| `lib/llm.ts` — `import 'server-only'` 없음 | 서버 전용 파일이지만 가드 없음. 실수로 클라이언트 import 시 API 키 번들 노출 위험 | 높음 |
| `docs/TASKS.md` 체크리스트 미갱신 | 모든 항목이 `[ ]` 상태 | 중간 |
| `.github/CODEOWNERS` 미생성 | 문서에 권고만 있음 | 낮음 |

---

## 실행/검증 결과

### npm install
```
결과: 불가
이유: package.json 없음
에러: ENOENT: no such file or directory, open 'package.json'
```

### npm run dev
```
결과: 불가
이유: package.json 없음
```

### npm run lint
```
결과: 불가
이유: package.json 없음
```

### npm run build
```
결과: 불가
이유: package.json, next.config.js, tsconfig.json 없음
```

### TypeScript 타입 검증 (정적 분석)
코드 수준에서 확인한 결과:
- `any` 타입 사용: **0건** (전체 파일 검색 완료)
- `satisfies CareerRecommendation` 사용으로 타입 안정성 보장 (`lib/recommendation.ts` 41행)
- `JSON.parse(content) as ExplainResponse` — 런타임 shape 검증 없음 (`lib/llm.ts` 124행)

---

## 에러 및 이슈

### [CRITICAL] Git 저장소 미초기화
- 원인: `git init` 미실행
- 영향: 버전 관리 불가, 협업 불가, 공모전 GitHub 제출 불가

### [CRITICAL] Next.js 프로젝트 미초기화
- 원인: `npx create-next-app` 미실행
- 영향: 로컬 실행 불가, 빌드 불가, 배포 불가
- 필요 파일: `package.json`, `next.config.js`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`

### [WARNING] `components/ResultCard.tsx` — API 에러 미처리
- 위치: 27~34행
- 원인: `fetch` 후 `res.ok` 확인 없이 `setExplainData(data)` 호출
- 영향: `/api/explain`이 `{ error: "서버 오류" }` 반환 시 `RoadmapPanel`에서 `data.headline` → `undefined` → 발표 중 UI 깨짐

### [WARNING] `lib/llm.ts` — `server-only` 가드 없음
- 위치: 파일 전체
- 원인: `import 'server-only'` 미선언
- 영향: 실수로 클라이언트 컴포넌트에서 import 시 빌드 에러 없이 API 키 번들 포함 가능

### [INFO] `docs/TASKS.md` 미갱신
- 위치: `docs/TASKS.md` 전체
- 원인: AI 세션에서 업데이트하지 않음
- 영향: public 저장소에서 "아무것도 완성하지 않은 프로젝트"로 보임

---

## 데모 가능 여부

**현재 상태: 데모 불가 (Next.js 미초기화)**

Next.js 프로젝트 초기화 완료 후 예상되는 데모 흐름:

```
1. http://localhost:3000 접속 → 홈 화면 (app/page.tsx)
2. "추천 시작하기" 클릭 → /recommend (app/recommend/page.tsx)
3. 상단 데모 버튼 A/B/C 중 하나 클릭 → 프로필 자동 입력
4. "진로 추천 받기" 클릭 → POST /api/recommend 호출
5. 결과 카드 3개 렌더링 (점수, 역량 배지, 추천 과목, 추천 이유)
6. "AI 해설 보기" 클릭 → POST /api/explain 호출 (OPENAI_API_KEY 없어도 fallback 동작)
7. RoadmapPanel 표시 (headline, fitSummary, evidence[], caution, roadmap 3단계)
```

데모 버튼 기대 결과:
- **A (PM 지향, 2024 컴공+경영)**: 1위 프로덕트 매니저 (약 100점, 복수전공 보너스 포함)
- **B (백엔드 지향, 2023 컴공)**: 1위 백엔드 개발자 (약 75점)
- **C (데이터 지향, 2024 컴공+경영)**: 1위 데이터 분석가 (약 75~90점)

---

## 다음 작업 우선순위

### 1순위 — Next.js 프로젝트 초기화 및 소스 통합

```bash
npx create-next-app majormap-ai --typescript --tailwind --app --no-src-dir
```

이후 현재 `초기설계안/` 내 아래 파일들을 새 프로젝트에 복사:
- `app/` 전체 (page.tsx, recommend/page.tsx, api/recommend/route.ts, api/explain/route.ts)
- `components/` 전체 (IntakeForm.tsx, ResultCard.tsx, RoadmapPanel.tsx)
- `lib/` 전체 (types.ts, sample-data.ts, scoring.ts, recommendation.ts, llm.ts)
- `docs/` 전체
- `README.md`, `.env.example`

### 2순위 — `.gitignore` 생성 및 git 초기화

```bash
git init
# .gitignore 생성 후
git add .
git commit -m "feat: initial MajorMap AI MVP implementation"
```

`.gitignore` 최소 내용:
```
.env.local
.env*.local
node_modules/
.next/
out/
```

### 3순위 — `ResultCard.tsx` API 에러 처리 수정

`components/ResultCard.tsx` 27~34행을 아래처럼 수정:

```typescript
const res = await fetch("/api/explain", { ... });
if (!res.ok) {
  setExplainError("AI 해설을 불러오는 데 실패했습니다.");
  return;
}
const data = await res.json();
setExplainData(data);
setShowPanel(true);
```

---
ChatGPT에게 붙여넣기 끝
