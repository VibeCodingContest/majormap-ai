# STATUS HANDOFF

작성일: 2026-04-13
기준: 현재 `majormap-ai` 저장소 실제 상태 우선

---

## 현재 저장소

- Git 저장소: 존재
- 현재 브랜치: `main`
- 작업 기준: 현재 열려 있는 `majormap-ai` 저장소를 source of truth로 사용

## 현재 구현 상태

- Next.js App Router + TypeScript + Tailwind 기반 실행 가능
- 추천 흐름 동작 완료
  - `/api/recommend`
  - 데모 프로필 A/B/C
  - Top 3 추천 카드 렌더링
- explain 흐름 동작 완료
  - `/api/explain`
  - `OPENAI_API_KEY` 미설정 시 fallback 설명 반환
  - 추천 흐름과 분리된 보조 기능으로 유지
- 계획 흐름 동작 완료
  - `/api/plan`
  - 결과 화면에서 계획 옵션 선택 가능
  - `/recommend/plan`에서 1~2개 학기 계획 결과 확인 가능
  - 교양 보완 및 재수강 반영 가능

## 현재 문서 정리 상태

- `docs/` 문서는 현재 저장소 기준으로 계속 정리 중
- `README.md`는 공개 저장소 기준으로 최신화 완료
- `AI_COLLAB.md`, `AI_REPORT_DRAFT.md`, `JUDGE_ONE_PAGER.md` 등 제출 보조 문서도 현재 로직 기준으로 갱신 중

## 검증 결과

- `npm run build`: 통과
- `npm run lint`: 미통과
- 현재 lint 이슈는 React hooks `set-state-in-effect` 규칙과 unused variable warning 중심

## 다음 작업

1. lint 오류 정리
2. live URL 기준 최종 QA 수행
3. public repo 제출물 정리
