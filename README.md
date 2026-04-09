# MajorMap AI

MajorMap AI는 대학생의 수강 이력, 학번별 샘플 커리큘럼, 전공 조합을 바탕으로 적합한 진로를 추천하고, 선택한 진로 기준 다음 1~2개 학기 수강 계획까지 이어주는 규칙 기반 진로 설계 웹앱이다. 핵심 추천과 계획 기능은 외부 LLM 없이 동작하며, AI 설명 기능은 보조 계층으로만 사용해 제출 안정성과 해석 가능성을 함께 확보했다.

---

## 문제 정의

복수전공·심화전공 대학생은 자신이 들은 과목이 어떤 세부 진로와 연결되는지 파악하기 어렵다. 학번에 따라 커리큘럼이 다르기 때문에 선배의 조언이 그대로 통하지 않는 경우도 많다.

이 서비스는 수강 이력과 전공 조합을 구조화된 규칙으로 분석해 진로 적합도와 다음 학기 계획을 계산하고, LLM은 그 결과를 한국어로 설명하는 보조 역할만 맡는다.

---

## MVP 범위

이번 버전에서 지원하는 범위는 아래로 제한된다.

| 항목 | 지원 범위 |
|---|---|
| 데이터셋 | 특정 실대학명이 아닌 샘플 커리큘럼 1종 |
| 학과군 | 컴퓨터공학, 경영학 |
| 학번 트랙 | 2023학번, 2024학번 |
| 진로 | 백엔드 개발자, 프로덕트 매니저, 데이터 분석가, 솔루션 컨설턴트 (4개) |
| 과목 | 17개 (샘플 데이터 기반) |

> 현재 과목명과 과목코드는 실제 대학 학사 시스템을 그대로 반영한 것이 아니라, MVP 검증을 위한 샘플 커리큘럼 데이터다. 과목코드는 화면 내 구분을 위한 내부 식별자다.

아래 기능은 이번 MVP에 포함되지 않는다.

- 실제 학사 시스템 연동
- 로그인 / 회원가입
- 모든 학과 지원
- 실제 채용 공고 연동

---

## 기술 구조

```
Next.js App Router (TypeScript + Tailwind CSS)

/app
  page.tsx                  # 홈 랜딩
  /recommend/page.tsx       # 추천 입력 화면
  /api/recommend/route.ts   # POST — 규칙 기반 진로 추천
  /api/plan/route.ts        # POST — 선택 진로 기준 1~2개 학기 계획
  /api/explain/route.ts     # POST — LLM 진로 해설 (OpenAI or fallback)

/lib
  types.ts                  # 공유 타입 정의
  sample-data.ts            # 과목·진로·데모 프로필 데이터
  scoring.ts                # 점수 계산 순수 함수
  recommendation.ts         # 추천 로직 (scoring 활용)
  planning.ts               # 학기별 계획 생성 규칙
  llm.ts                    # OpenAI 호출 + fallback 생성

/components
  IntakeForm.tsx            # 입력 폼 (select + 체크박스 + 데모 버튼)
  ResultCard.tsx            # 추천 결과 카드
  PlanSetupPanel.tsx        # 계획 옵션 패널
  SemesterPlanPanel.tsx     # 학기별 계획 결과 패널
  RoadmapPanel.tsx          # AI 해설 + 로드맵 패널
```

추천과 계획 로직은 LLM에 의존하지 않는다. 점수 계산은 필수 역량 커버리지, 선택 역량 상한, 전공 적합도, low-evidence penalty를 반영한 보수적 규칙으로 처리하고, LLM은 결과 설명 문장 생성에만 사용한다.

---

## 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (선택)
cp .env.example .env.local
# .env.local 파일에 OPENAI_API_KEY 입력

# 3. 개발 서버 실행
npm run dev
# http://localhost:3000 접속
```

---

## 환경변수

| 변수명 | 필수 여부 | 설명 |
|---|---|---|
| `OPENAI_API_KEY` | 선택 | 없으면 규칙 기반 fallback 설명이 자동 제공됨 |

> API 키는 절대 커밋하지 않는다. `.env.local`은 `.gitignore`에 포함되어 있다.

---

## 데모 시나리오

서비스를 실행하면 `/recommend` 화면 상단에 빠른 데모 프로필 버튼 3개가 있다.

| 버튼 | 프로필 | 기대 1위 진로 |
|---|---|---|
| A — PM 지향 | 2024학번, 컴공+경영, 비즈니스·전략 과목 수강 | 프로덕트 매니저 |
| B — 백엔드 지향 | 2023학번, 컴공, 프로그래밍·알고리즘·시스템 과목 수강 | 백엔드 개발자 |
| C — 데이터 지향 | 2024학번, 컴공+경영, 데이터·통계·알고리즘 과목 수강 | 데이터 분석가 |

상세 클릭 흐름은 [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)를 참고한다.

임시 외부 공유 시 Cloudflare tunnel 테스트 절차는 [docs/TUNNEL_TEST.md](docs/TUNNEL_TEST.md)를 참고한다.

---

## 프로젝트 구조 참고 문서

| 문서 | 내용 |
|---|---|
| [docs/README.md](docs/README.md) | 현재 문서 묶음의 역할 안내 |
| [docs/PLAN.md](docs/PLAN.md) | 문제 정의 및 해결 방향 |
| [docs/PROJECT_SCOPE.md](docs/PROJECT_SCOPE.md) | MVP 범위와 제외 범위 |
| [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) | 현재 추천 흐름 기준 클릭 시나리오 |
| [docs/DEMO_BLOCKERS.md](docs/DEMO_BLOCKERS.md) | 현재 데모 리스크 및 정리 기준 |
| [docs/QA_SCENARIOS.md](docs/QA_SCENARIOS.md) | 내부 추천 QA 시나리오 |
| [docs/PROD_QA.md](docs/PROD_QA.md) | live URL 최종 수동 점검 문서 |
| [docs/FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md) | 제출 직전 체크리스트 |
| [docs/SUBMISSION_GUIDE.md](docs/SUBMISSION_GUIDE.md) | public repo / live URL / 제출물 정리 |
| [docs/AI_REPORT_DRAFT.md](docs/AI_REPORT_DRAFT.md) | AI report PDF 원문 초안 |
| [docs/JUDGE_ONE_PAGER.md](docs/JUDGE_ONE_PAGER.md) | 심사용 1페이지 요약 |
| [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) | 브랜치 전략 및 협업 규칙 |
| [docs/AI_COLLAB.md](docs/AI_COLLAB.md) | AI 협업 기록 |
| [docs/PROMPT_LOG_TEMPLATE.md](docs/PROMPT_LOG_TEMPLATE.md) | 프롬프트 로그 양식 |
