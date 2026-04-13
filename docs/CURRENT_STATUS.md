# CURRENT STATUS

기준: 현재 `majormap-ai` 저장소의 실제 코드 상태

---

## 현재 실제 기능

- 1단계 진로 추천
  - 학생의 학번, 전공, 수강 과목, 관심 키워드를 입력받아 Top 3 진로를 추천한다.
  - 특정 실대학명이 아닌 샘플 커리큘럼 데이터셋 기준으로 동작한다.
- 2단계 학기 계획
  - 선택한 진로를 기준으로 다음 1~2개 학기 계획을 생성한다.
  - 목표 학점은 12~21학점 범위에서 조정할 수 있다.
  - 교양 포함 여부를 선택할 수 있다.
  - 재수강 과목을 계획에 반영할 수 있다.
- explain 보조 기능
  - 추천 결과에 대한 AI 해설을 제공한다.
  - `OPENAI_API_KEY`가 없거나 응답이 실패하면 fallback 설명으로 전환한다.

## 실제 라우트

- `/`
- `/recommend`
- `/recommend/result`
- `/recommend/plan`
- `/api/recommend`
- `/api/plan`
- `/api/explain`

## recommend 흐름

1. `/recommend`에서 `IntakeForm`을 렌더링한다.
2. 데모 프로필 A/B/C 또는 직접 입력으로 학생 프로필을 만든다.
3. `POST /api/recommend`를 호출한다.
4. 결과 카드 Top 3를 렌더링한다.
5. 각 카드에서 점수 세부 내역, 근거 충분도, 추천 요약, 보유/부족 역량, 핵심 미이수 과목을 확인할 수 있다.

## plan 흐름 존재 여부

존재한다.

현재 구현 파일:

- `app/api/plan/route.ts`
- `lib/planning.ts`
- `components/PlanSetupPanel.tsx`
- `components/SemesterPlanPanel.tsx`

동작 방식:

- 결과 카드에서 `이 진로로 계획 짜기`를 누르면 2단계 계획 옵션 패널이 열린다.
- 계획 옵션은 결과 화면에서 선택한다.
- 옵션 선택 후 `POST /api/plan`을 호출한다.
- 이후 `/recommend/plan` 화면에서 학기별 추천 과목, 남은 학점 교양 보완 안내, deferred 과목을 표시한다.

## explain fallback 존재 여부

존재한다.

- `lib/llm.ts`에서 `OPENAI_API_KEY`가 없으면 fallback 설명을 반환한다.
- `/api/explain`는 실패 시 에러 응답을 반환한다.
- `ResultCard`와 `RoadmapPanel`은 explain 실패가 전체 추천/계획 흐름을 깨지 않도록 방어되어 있다.

## 점수 로직 상태

- 필수 역량은 커버리지 비율 기반으로 점수화한다.
- 선택 역량 점수는 상한을 축소해 과도한 고득점을 막는다.
- 전공 보너스는 보조 수준으로만 반영한다.
- 관련 이수 과목 수가 적으면 low-evidence penalty를 적용한다.
- 결과 카드에는 `근거 충분도` 배지를 함께 표시한다.

## 배포 가능 여부

부분 가능하다.

근거:

- `npm run build` 통과
- `npm run lint`는 현재 실패
- Next.js 빌드 결과에서 `/api/recommend`, `/api/plan`, `/api/explain`, `/recommend`, `/recommend/result`, `/recommend/plan` 라우트가 확인된다.

현재 lint 이슈:

- `app/recommend/plan/page.tsx`: effect 내부 `setState` 경고가 error로 처리됨
- `components/IntakeForm.tsx`: effect 내부 `setState` 2건이 error로 처리됨
- `app/recommend/result/page.tsx`: unused variable warning 1건

## 코드와 문서 일치 여부

핵심 서비스 문서 기준으로는 일치한다.

- README와 홈/추천 페이지 카피는 2단계 구조에 맞게 반영됨
- 샘플 커리큘럼 기반 제한된 MVP라는 점이 홈, 입력 화면, README에 명시됨
- 추천, explain, planning이 분리된 구조가 유지됨
- explain은 보조 기능, 추천/계획은 규칙 기반이라는 구조가 코드와 문서 모두에서 유지됨

다만 제출 보조 문서 전체를 한 번 더 훑어 최종 문구를 다듬는 작업은 권장된다.

## 다음 액션 1개

lint 오류를 먼저 정리한 뒤, live URL에서 A/B/C 시나리오를 실제 클릭으로 검증하고 제출 문서 최종본에 상태를 반영한다.
