# MajorMap AI

복수전공·심화전공 대학생이 자신의 수강 이력과 학번별 커리큘럼을 입력하면, 적합한 진로를 추천하고 부족한 역량과 보완 과목을 안내하는 AI 진로 설계 웹앱.

---

## 문제 정의

복수전공·심화전공 대학생은 자신이 들은 과목이 어떤 세부 진로와 연결되는지 파악하기 어렵다. 학번에 따라 커리큘럼이 다르기 때문에 선배의 조언이 그대로 통하지 않는 경우도 많다.

이 서비스는 수강 이력과 전공 조합을 구조화된 규칙으로 분석해 진로 적합도를 계산하고, LLM이 그 결과를 한국어로 설명해준다.

---

## MVP 범위

이번 버전에서 지원하는 범위는 아래로 제한된다.

| 항목 | 지원 범위 |
|---|---|
| 대학 | 1개 대학 가정 |
| 학과군 | 컴퓨터공학, 경영학 |
| 학번 트랙 | 2023학번, 2024학번 |
| 진로 | 백엔드 개발자, 프로덕트 매니저, 데이터 분석가, 솔루션 컨설턴트 (4개) |
| 과목 | 15개 (샘플 데이터 기반) |

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
  /api/explain/route.ts     # POST — LLM 진로 해설 (OpenAI or fallback)

/lib
  types.ts                  # 공유 타입 정의
  sample-data.ts            # 과목·진로·데모 프로필 데이터
  scoring.ts                # 점수 계산 순수 함수
  recommendation.ts         # 추천 로직 (scoring 활용)
  llm.ts                    # OpenAI 호출 + fallback 생성

/components
  IntakeForm.tsx            # 입력 폼 (select + 체크박스 + 데모 버튼)
  ResultCard.tsx            # 추천 결과 카드
  RoadmapPanel.tsx          # AI 해설 + 로드맵 패널
```

추천 로직은 LLM에 의존하지 않는다. 점수 계산은 구조화 데이터 기반 규칙으로 처리하고, LLM은 결과 설명 문장 생성에만 사용한다.

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

---

## 프로젝트 구조 참고 문서

| 문서 | 내용 |
|---|---|
| [docs/PLAN.md](docs/PLAN.md) | 문제 정의 및 해결 방향 |
| [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) | 발표용 데모 클릭 스크립트 |
| [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) | 브랜치 전략 및 협업 규칙 |
| [docs/AI_COLLAB.md](docs/AI_COLLAB.md) | AI 협업 기록 |
| [docs/PROMPT_LOG_TEMPLATE.md](docs/PROMPT_LOG_TEMPLATE.md) | 프롬프트 로그 양식 |
