# DEMO BLOCKERS

기준: `majormap-ai` canonical repo의 현재 코드 상태

---

## 현재 상태 요약

| 항목 | 상태 |
|---|---|
| `npm run lint` | 미통과 |
| `npm run build` | 통과 |
| 추천 API | 존재 |
| 계획 API | 존재 |
| explain API | 존재 |
| explain fallback | 존재 |

---

## 현재 치명적 블로커

- lint 미통과
- `react-hooks/set-state-in-effect` 규칙 위반이 `app/recommend/plan/page.tsx`, `components/IntakeForm.tsx`에 존재
- `app/recommend/result/page.tsx`에 unused variable warning이 존재

다만 이는 빌드 자체를 막는 문제는 아니며, 현재 기준에서는 추천 흐름, 계획 흐름, explain fallback이 데모를 막는 수준의 런타임 치명 오류로 확인되지는 않았다.

---

## 주의할 리스크

- `OPENAI_API_KEY`가 없는 환경에서는 explain이 fallback 설명으로 동작한다.
- live URL에서 실제 브라우저 기준 수동 점검은 제출 직전에 다시 필요하다.
- 문서는 반드시 `majormap-ai` 기준으로만 업데이트해야 하며, `초기설계안`은 legacy 참고용이다.

---

## 결론

현재 기준으로 데모 진행은 가능하지만, 제출 완성도를 높이려면 lint 오류 정리 후 배포 환경과 제출물 점검을 이어가는 것이 좋다.
