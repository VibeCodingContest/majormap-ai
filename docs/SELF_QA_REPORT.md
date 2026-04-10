# SELF QA REPORT

## 1. QA 수행 기준 브랜치
- `feat/junha-ui-work`

## 2. 점검 일시
- `2026-04-10 11:55:42 KST`

## 3. 점검 범위
- 기본 검증: `npm run lint`, `npm run build`
- 라우트 존재 확인: `/`, `/recommend`, `/api/recommend`, `/api/plan`, `/api/explain`
- 화면/흐름 점검 대상:
- `app/page.tsx`
- `app/recommend/page.tsx`
- `components/IntakeForm.tsx`
- `components/ResultCard.tsx`
- `components/PlanSetupPanel.tsx`
- `components/SemesterPlanPanel.tsx`
- `app/api/recommend/route.ts`
- `app/api/plan/route.ts`
- `app/api/explain/route.ts`
- `lib/recommendation.ts`
- `lib/planning.ts`
- `lib/scoring.ts`
- `lib/llm.ts`
- 점검 방식:
- 코드 리뷰 기반 QA
- `next build` route manifest 확인
- `.next/dev/logs/next-development.log` 기반 local dev 에러 로그 확인
- 참고:
- 로컬 dev 서버 프로세스 존재는 확인했으나, 현재 QA 환경에서는 localhost HTTP 직접 호출이 안정적으로 되지 않아 브라우저 수준 수동 검증은 로그와 코드 기준으로 보완함

## 4. 통과 항목
- `npm run lint` 통과
- `npm run build` 통과
- `next build` 기준 라우트 생성 확인:
- `/`
- `/_not-found`
- `/recommend`
- `/api/recommend`
- `/api/plan`
- `/api/explain`
- 홈 화면은 서비스 한 줄 정의, 현재 지원 범위, CTA가 모두 명시되어 있음: [app/page.tsx](/Users/junnha/Desktop/Practice/majormap-ai/app/page.tsx#L21)
- 추천 화면은 1단계 추천과 2단계 계획 흐름이 상단에서 명시되어 있음: [app/recommend/page.tsx](/Users/junnha/Desktop/Practice/majormap-ai/app/recommend/page.tsx#L5)
- explain 흐름은 OpenAI API 키가 없거나 응답 파싱 실패 시 fallback을 반환하도록 안전장치가 있음: [lib/llm.ts](/Users/junnha/Desktop/Practice/majormap-ai/lib/llm.ts#L113)
- 계획 생성 로직은 개설 학기, 선수과목, 목표 학점 한도를 모두 반영함: [lib/planning.ts](/Users/junnha/Desktop/Practice/majormap-ai/lib/planning.ts#L214)
- 선택한 진로의 인라인 계획 패널로 스크롤 포커싱하는 UX 보완이 존재함: [components/IntakeForm.tsx](/Users/junnha/Desktop/Practice/majormap-ai/components/IntakeForm.tsx#L360)

## 5. 발견 이슈 목록

### QA-001
- 영역: `IntakeForm`
- 유형: 로직 + UX
- 증상:
- 학번/주전공/복수전공을 바꾼 뒤에는 화면에 보이지 않는 과목이 계속 선택 상태로 남아 payload에 포함될 수 있음
- 재현 방법:
- `컴퓨터공학` 기준 과목 여러 개를 선택하고 성적 입력
- 학번 또는 주전공/복수전공 조합을 바꿔 visible course 목록을 변경
- 화면에서는 일부 과목이 사라졌지만 `추천 받기`를 누름
- 예상 동작:
- 현재 화면에서 보이는 과목 기준으로만 선택 상태가 유지되거나, 숨겨진 선택은 명시적으로 정리되어야 함
- 실제 동작:
- `selectedCourses`는 유지되고 `buildCurrentProfile()`이 전체 선택 상태를 그대로 payload로 변환함
- 결과적으로 사용자가 보지 못하는 과목이 추천/계획 계산에 포함될 수 있음
- 심각도:
- High
- 추정 원인:
- 필터링 기준은 `visibleCourses`로 계산하지만 제출 payload는 `selectedCourses` 전체를 사용함
- 참고 코드:
- [components/IntakeForm.tsx](/Users/junnha/Desktop/Practice/majormap-ai/components/IntakeForm.tsx#L191)
- [components/IntakeForm.tsx](/Users/junnha/Desktop/Practice/majormap-ai/components/IntakeForm.tsx#L205)
- [components/IntakeForm.tsx](/Users/junnha/Desktop/Practice/majormap-ai/components/IntakeForm.tsx#L423)
- 수정 권장 방향:
- 학번/전공 조합 변경 시 `selectedCourses`를 현재 `visibleCourses` 기준으로 prune 하거나
- 제출 직전 payload 생성 시 `visibleCourses`에 존재하는 과목만 반영

### QA-002
- 영역: `RecommendPage` / `IntakeForm`
- 유형: 런타임 안정성
- 증상:
- `/recommend` 진입 시 hydration mismatch가 반복 기록됨
- 재현 방법:
- 현재 local dev 서버 로그 확인
- 파일: `.next/dev/logs/next-development.log`
- 예상 동작:
- `/recommend` 진입 시 hydration error 없이 server/client markup이 일치해야 함
- 실제 동작:
- 브라우저/서버 로그에 `Hydration failed because the server rendered HTML didn't match the client`가 반복 기록됨
- 심각도:
- High
- 추정 원인:
- 최근 `IntakeForm` 데모 프로필 영역 구조 변경이 진행되는 동안 active dev server가 이전 SSR 결과와 새로운 client tree를 혼합한 것으로 보임
- 현재 소스 기준으로 `Date.now()`, `Math.random()`, locale date formatting 같은 명백한 비결정성은 보이지 않아, dev server stale state 또는 HMR 세션 오염 가능성이 큼
- 참고 로그:
- [.next/dev/logs/next-development.log](/Users/junnha/Desktop/Practice/majormap-ai/.next/dev/logs/next-development.log#L376)
- [.next/dev/logs/next-development.log](/Users/junnha/Desktop/Practice/majormap-ai/.next/dev/logs/next-development.log#L413)
- 참고 코드:
- [components/IntakeForm.tsx](/Users/junnha/Desktop/Practice/majormap-ai/components/IntakeForm.tsx#L393)
- 수정 권장 방향:
- 우선 dev server 완전 재시작 후 clean reproduction 여부 재확인
- 브라우저 확장 개입 여부와 HMR 캐시 오염 여부를 분리 검증
- clean restart 후에도 재현되면 데모 프로필 영역을 중심으로 SSR/CSR 초기 구조 차이 추가 점검

### QA-003
- 영역: `IntakeForm`
- 유형: UX + 로직
- 증상:
- 데모 프로필 영역의 `초기화` 버튼이 과목/성적만 비우는 것이 아니라 복수전공도 `없음`으로 되돌림
- 재현 방법:
- 복수전공을 `경영학` 등으로 선택
- 데모 프로필 영역의 `초기화` 버튼 클릭
- 예상 동작:
- 버튼 라벨상 과목 선택만 비우거나, 최소한 초기화 범위가 명확해야 함
- 실제 동작:
- `secondaryMajor`도 함께 `undefined`로 변경됨
- 심각도:
- Medium
- 추정 원인:
- `resetCourseSelections()` 내부에서 선택 과목 초기화와 함께 profile 일부 필드까지 수정하고 있음
- 참고 코드:
- [components/IntakeForm.tsx](/Users/junnha/Desktop/Practice/majormap-ai/components/IntakeForm.tsx#L263)
- [components/IntakeForm.tsx](/Users/junnha/Desktop/Practice/majormap-ai/components/IntakeForm.tsx#L404)
- 수정 권장 방향:
- 버튼 라벨을 범위에 맞게 바꾸거나
- 실제 동작을 과목/성적 초기화로만 제한

### QA-004
- 영역: `Planning` / `SemesterPlanPanel`
- 유형: UX + 데이터 표현
- 증상:
- `이월된 과목` 섹션이 "모든 이월 과목"처럼 보이지만 실제로는 `coreMissingCourseIds` 중 배치되지 않은 과목만 보여줌
- 재현 방법:
- 계획 생성 후 `이월된 과목` 섹션 내용 확인
- 로직상 `deferredCourses` 생성 기준 확인
- 예상 동작:
- 섹션명이 실제 데이터 범위를 반영해야 함
- 실제 동작:
- 사용자는 모든 미배치 과목이 정리된 것으로 이해하기 쉽지만, 실제로는 핵심 과목 일부만 표시됨
- 심각도:
- Medium
- 추정 원인:
- `deferredCourses`가 `coreMissingCourseIds`에서만 계산됨
- 참고 코드:
- [lib/planning.ts](/Users/junnha/Desktop/Practice/majormap-ai/lib/planning.ts#L195)
- [lib/planning.ts](/Users/junnha/Desktop/Practice/majormap-ai/lib/planning.ts#L292)
- [components/SemesterPlanPanel.tsx](/Users/junnha/Desktop/Practice/majormap-ai/components/SemesterPlanPanel.tsx#L117)
- 수정 권장 방향:
- 섹션명을 `이월된 핵심 과목`으로 바꾸거나
- 실제 deferred candidate 전체를 보여주는 구조로 확장

### QA-005
- 영역: `SemesterPlanPanel`
- 유형: UX
- 증상:
- 학점이 덜 채워진 학기 카드에서 큰 빈 공간이 남아 화면이 덜 정돈돼 보임
- 재현 방법:
- 목표 학점을 높게 설정하고 계획 생성
- 한 학기 카드에 과목 수가 적고 `남은 학점` 안내만 표시되는 경우 확인
- 예상 동작:
- 정보 밀도가 낮아도 레이아웃이 의도적으로 보이거나 빈 공간이 덜 두드러져야 함
- 실제 동작:
- 2열 레이아웃 안에서 한 학기 카드의 세로 길이가 다른 카드에 맞춰 늘어나 큰 공백이 보임
- 심각도:
- Low
- 추정 원인:
- `lg:grid-cols-2` 그리드에서 카드 높이가 내용량에 따라 크게 차이 남
- 참고 코드:
- [components/SemesterPlanPanel.tsx](/Users/junnha/Desktop/Practice/majormap-ai/components/SemesterPlanPanel.tsx#L45)
- 수정 권장 방향:
- 카드 내부 레이아웃 또는 안내 박스 배치를 조정해 빈 공간 시각적 부담 완화

## 6. 이슈별 심각도

### Critical
- 없음

### High
- QA-001
- QA-002

### Medium
- QA-003
- QA-004

### Low
- QA-005

## 7. 바로 수정 권장 항목 Top 5
- QA-001: 필터 변경 후 숨은 과목이 payload에 남는 문제 수정
- QA-002: `/recommend` hydration mismatch clean reproduction 및 원인 분리
- QA-003: `초기화` 버튼의 실제 범위와 라벨 불일치 해소
- QA-004: `이월된 과목` 섹션의 데이터 범위/문구 정합성 수정
- QA-005: 학기 카드 빈 공간 UX 완화

## 8. 나중에 개선해도 되는 항목
- 계획 결과 카드 높이 불균형 완화
- 데모 프로필 설명 정렬/시각적 연결성 개선
- `/recommend` 상단 설명에 현재 지원 범위를 더 짧게 재노출하는 UX 보강
- 로컬 QA용 dev 서버 재시작/캐시 초기화 절차 문서화

## 9. 배포 전 반드시 확인할 항목
- `/recommend`에서 hydration mismatch가 clean restart 후에도 재현되는지
- 학번/전공 변경 후 숨은 과목이 추천 payload에 포함되지 않는지
- `초기화` 버튼이 의도한 범위만 초기화하는지
- plan 결과의 `이월된 과목` 섹션 문구와 실제 데이터 범위가 일치하는지
- explain API 키 부재 상황에서 fallback이 실제 UI에서 자연스럽게 보이는지
- 브라우저 수동 QA 기준 모바일 뷰에서 홈/추천/결과/계획 흐름이 깨지지 않는지

## 10. 전체 QA 총평
- 현재 브랜치는 `lint`와 `build`는 통과하며, 추천/계획/explain의 기본 구조와 fallback 안전장치는 갖춰져 있다.
- 다만 추천 입력폼에서 필터 변경 후 숨은 선택 과목이 payload에 남는 문제는 결과 신뢰도에 직접 영향을 주는 High 이슈다.
- 또한 local dev 로그 기준 `/recommend` hydration mismatch가 반복 기록되어 런타임 안정성 점검이 추가로 필요하다.
- 나머지 이슈는 주로 UX와 데이터 표현 정합성 문제이며, 배포 전에는 최소한 High 이슈 2건은 해소 또는 clean reproduction 해제 확인이 권장된다.

## 부록 A. Hydration Mismatch 원인 후보
- active dev server가 오래 켜져 있던 상태에서 `IntakeForm` 구조 변경이 누적되며 stale SSR 결과와 최신 client bundle이 섞였을 가능성
- 브라우저 확장 또는 추천 페이지 탭을 오래 유지한 상태에서 HMR이 누적된 가능성
- 현재 소스 기준으로는 `Date.now()`, `Math.random()`, locale time formatting, `typeof window` 분기 같은 대표적인 hydration 유발 패턴은 직접 확인되지 않음
- 따라서 우선순위는 `clean restart -> hard refresh -> extension off -> 재현 여부 확인` 순서가 적절함

## 부록 B. UX 이슈와 로직 이슈 구분
- 로직 중심:
- QA-001
- QA-002
- UX/표현 중심:
- QA-003
- QA-004
- QA-005
