# AI 협업 기록

이 문서는 MajorMap AI 개발 과정에서 AI 도구를 어떻게 활용했는지, 그리고 사람이 어떤 부분을 직접 판단하고 검토했는지를 기록한다.

---

## AI를 활용한 작업 영역

| 작업 | 도구 | 결과 파일 |
|---|---|---|
| 저장소 분석 및 작업 계획 수립 | Cursor Agent (Plan Mode) | — |
| 타입 설계 및 확장 | Cursor Agent | `lib/types.ts` |
| 샘플 데이터 설계 | Cursor Agent | `lib/sample-data.ts` |
| 점수 계산 로직 분리 | Cursor Agent | `lib/scoring.ts` |
| 추천 로직 리팩터링 | Cursor Agent | `lib/recommendation.ts` |
| LLM API 구현 및 fallback 설계 | Cursor Agent | `lib/llm.ts`, `app/api/explain/route.ts` |
| 추천 API 입력 검증 보강 | Cursor Agent | `app/api/recommend/route.ts` |
| IntakeForm 데모형 UI 교체 | Cursor Agent | `components/IntakeForm.tsx` |
| ResultCard 개선 | Cursor Agent | `components/ResultCard.tsx` |
| RoadmapPanel 신규 작성 | Cursor Agent | `components/RoadmapPanel.tsx` |
| 공모전 제출 문서 초안 작성 | Cursor Agent | `README.md`, `docs/*.md` |

---

## 사람이 직접 검토/판단한 항목

### 데이터 타당성 검토
- 과목 15개와 진로 4개의 태그 매핑이 실제 커리큘럼 맥락과 맞는지 직접 확인
- 솔루션 컨설턴트 진로의 `consulting` 태그 도입 적절성 판단
- 2023/2024 학번 트랙 분리 기준 확정

### 점수 공식 검토
- `MAX_RAW_SCORE = 120` 기준값이 진로별 태그 수 차이를 감안했을 때 균형 잡혔는지 확인
- 키워드 보너스 (+8점/매칭)와 복수전공 보너스 (+10점)의 가중치가 결과 역전을 일으키지 않는지 확인

### UX 흐름 검토
- 데모 프로필 A/B/C 버튼의 라벨과 설명 문구 검토
- 결과 카드의 정보 배치 순서 (점수 → scoreBreakdown → 역량 → 과목 → 이유 → AI 해설) 결정
- 체크박스 목록에서 학번/전공 변경 시 선택 초기화 동작 확인

### 보안 검토
- `OPENAI_API_KEY`가 클라이언트 코드(`'use client'` 파일)에 노출되지 않는지 확인
- `lib/llm.ts`가 서버 전용으로만 동작하는지 확인

### LLM 프롬프트 검토
- AI가 없는 사실을 만들지 않도록 프롬프트에 "제공된 데이터에 없는 정보를 만들어내지 마세요" 제약 명시
- fallback 응답이 데모가 깨지지 않는 수준의 내용을 담고 있는지 확인

---

## AI 한계와 사람 판단이 필요했던 결정

| 상황 | AI 출력 | 사람의 판단 |
|---|---|---|
| 과목-진로 태그 매핑 | AI가 제안한 태그 구조 | 실제 커리큘럼 맥락에서 타당한지 직접 확인 후 승인 |
| scoreBreakdown 정규화 기준 | MAX_RAW_SCORE = 120 제안 | 진로 4개 데이터에서 실제 점수 분포를 확인하고 유지 결정 |
| LLM fallback 내용 | 규칙 기반 fallback 문장 자동 생성 | 데모 발표 시 어색하지 않은 문구인지 사람이 최종 확인 |
| 데모 프로필 3개 구성 | A/B/C 입력값 자동 설계 | 각 프로필이 명확히 다른 1위 진로를 내도록 직접 검증 |

---

## 작업 로그

> 상세 작업 로그 양식은 [docs/PROMPT_LOG_TEMPLATE.md](PROMPT_LOG_TEMPLATE.md)를 참고한다.

### 2026-04-07 — 저장소 초기 분석 및 전체 MVP 구현

- **담당**: 성혁
- **도구**: Cursor Agent (Plan Mode → Agent Mode)
- **프롬프트 요약**: 저장소를 분석해 데모 기준 부족한 부분을 파악하고, MVP 완성을 위한 5가지 작업을 계획한 뒤 순서대로 구현 요청
- **AI 구현 범위**: `lib/types.ts` 타입 확장, `lib/sample-data.ts` 데이터 보강, `lib/scoring.ts` 신규, `lib/recommendation.ts` 리팩터, `lib/llm.ts` 신규, `app/api/explain/route.ts` 신규, `components/IntakeForm.tsx` 전면 교체, `components/ResultCard.tsx` 개선, `components/RoadmapPanel.tsx` 신규
- **사람이 수정/검토한 부분**: 과목-진로 태그 매핑 타당성, 점수 정규화 기준, 데모 프로필 결과 차이 검증, 보안(API 키 서버 전용) 확인
- **남은 이슈**: Next.js 프로젝트 설정 파일(`package.json`, `tailwind.config.js` 등) 실제 저장소에 추가 필요, Vercel 배포 설정 필요

### 2026-04-09 — canonical repo 정규화 및 문서 흡수

- **담당**: 성혁
- **도구**: Cursor Agent
- **프롬프트 요약**: `majormap-ai`를 유일한 작업 기준 repo로 확정하고, `초기설계안`에서는 최신 문서 초안만 선별 흡수해 README, 홈 카피, 제출 문서 묶음을 정리 요청
- **AI 구현 범위**: `README.md`, `app/page.tsx` 카피 업데이트, `docs/README.md` 추가, `docs/AI_REPORT_DRAFT.md`, `docs/JUDGE_ONE_PAGER.md`, `docs/FINAL_CHECKLIST.md`, `docs/SUBMISSION_GUIDE.md`, `docs/PROD_QA.md`, `docs/DEMO_BLOCKERS.md`, `docs/QA_SCENARIOS.md` 추가, `docs/GIT_WORKFLOW.md`, `docs/DEMO_SCRIPT.md`, `docs/STATUS_HANDOFF.md`, `docs/TASKS.md` 정규화
- **사람이 수정/검토한 부분**: canonical repo를 `majormap-ai`로 고정할지 여부, `초기설계안` 코드 폴더를 현재 repo에 덮어쓰지 않는 원칙 유지, 현재 코드와 맞지 않는 2단계 계획 문구 제거 여부 판단
- **남은 이슈**: `초기설계안` 폴더 자체의 archive 이동은 로컬 파일 이동 작업이므로 별도 수동 실행 또는 후속 정리가 필요

### 2026-04-09 — 점수 신뢰도 및 추천→계획 UX 개선

- **담당**: 성혁
- **도구**: Cursor Agent
- **프롬프트 요약**: 2단계 범위는 유지한 채 홈 첫인상, 샘플 커리큘럼 고지, 점수 후함 보정, 카드 인라인 계획 UX, 남은 학점 교양 안내를 개선 요청
- **AI 구현 범위**: `app/page.tsx` 정보 섹션 추가, `components/IntakeForm.tsx` 데이터셋 안내 및 인라인 계획 흐름 개선, `components/ResultCard.tsx` 근거 충분도/점수 해석 강화, `components/SemesterPlanPanel.tsx` 남은 학점 보완 블록 추가, `lib/scoring.ts` 커버리지 기반 점수화 및 low-evidence penalty 반영, `lib/planning.ts` 남은 학점 교양 안내 추가, 관련 문서 동기화
- **사람이 수정/검토한 부분**: 실대학명이 아닌 샘플 커리큘럼으로 명시할지 여부, 점수 보정 강도, 카드 아래 인라인 계획 UX가 데모 흐름을 더 자연스럽게 만드는지 여부
- **남은 이슈**: live URL에서 A/B/C 시나리오를 실제 클릭으로 검증해 점수 체감과 스크롤 동작을 최종 확인할 필요가 있음
