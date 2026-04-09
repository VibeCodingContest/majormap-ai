# STATUS HANDOFF

작성일: 2026-04-09  
기준: 현재 워크스페이스 실제 상태 우선

---

## 현재 브랜치

- `main`
- 원격 추적 브랜치: `origin/main`

## 최근 커밋

1. `e8cd5c8 feat: bootstrap runnable MajorMap AI MVP`

## 현재 변경 파일 목록

### 수정됨
- `README.md`
- `app/api/recommend/route.ts`
- `app/page.tsx`
- `app/recommend/page.tsx`
- `components/IntakeForm.tsx`
- `components/ResultCard.tsx`
- `docs/AI_COLLAB.md`
- `docs/TASKS.md`
- `lib/recommendation.ts`
- `lib/sample-data.ts`
- `lib/scoring.ts`
- `lib/types.ts`

### 신규
- `app/api/plan/route.ts`
- `components/PlanSetupPanel.tsx`
- `components/SemesterPlanPanel.tsx`
- `lib/planning.ts`

## 현재 구현 완료된 기능

- 실행 가능한 Next.js App Router + TypeScript + Tailwind 프로젝트 구성 완료
- `npm run lint` 통과
- `npm run build` 통과
- 1단계 추천 MVP 동작
  - `/api/recommend`
  - 데모 프로필 A/B/C
  - 입력 폼 제출
  - Top 3 결과 카드 렌더링
- 추천 결과 강화
  - 주전공 / 복수전공 / 관심 키워드 점수 반영
  - 추천 요약, 강점, 부족 역량, 미이수 핵심 과목 preview 제공
- 2단계 계획 MVP 추가
  - `/api/plan`
  - 진로별 핵심 과목 우선 배치
  - 다음 1~2개 학기, 12/15/18학점 옵션
  - 교양 포함 여부 옵션
  - 학기별 계획 카드와 deferred 과목 표시
- explain 경로는 보조 기능으로 유지
  - `server-only` 가드 존재
  - fallback 응답 유지

## 현재 미완성 기능

- 제출 체크리스트 문서 미작성
- GitHub 협업용 `CODEOWNERS` 미작성
- 배포 환경 설정 미완료
- 데모 스크립트 문서는 아직 2단계 계획 흐름을 완전히 반영하지 않음

## 실행/검증 결과

- `npm install`: 가능
- `npm run lint`: 통과
- `npm run build`: 통과
- `npm run dev`: 가능
  - 포트는 환경에 따라 `3000`이 아닐 수 있음
  - 실제 점검 중에는 기존 서버가 `3001`에서 실행 중이었음

## 데모 가능 여부

현재 기준으로 데모 가능.

### 데모 기본 흐름
1. `/recommend` 진입
2. 데모 프로필 A/B/C 선택
3. `진로 추천 받기`
4. 결과 카드 Top 3 확인
5. 원하는 카드에서 `이 진로로 계획 짜기`
6. 다음 학기 / 목표 학점 / 학기 수 / 교양 포함 여부 선택
7. `다음 학기 계획 생성`
8. 학기별 추천 과목과 deferred 과목 확인

## 다음 작업 우선순위

1. `docs/DEMO_SCRIPT.md`를 2단계 계획 흐름까지 맞게 갱신
2. 제출 체크리스트 문서 작성
3. 배포 환경 설정 및 최종 데모 리허설
