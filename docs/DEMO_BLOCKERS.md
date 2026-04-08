# DEMO BLOCKERS

작성일: 2026-04-08  
기준: `docs/DEMO_BLOCKERS.md`에 기록된 블로커 수정 완료 후 재검증

## 현재 상태 요약

| 항목 | 결과 |
|---|---|
| `npm run lint` | 통과 |
| `npm run build` | 통과 |
| `npm run dev` | 기동 확인 완료 |
| 데모 A | 프로덕트 매니저 1위 |
| 데모 B | 백엔드 개발자 1위 |
| 데모 C | 데이터 분석가 1위 |
| `.gitignore` | 생성 완료 |

---

## 1. 치명적

없음.

### 해결 완료 기록

- `BLOCKER-1` 해결: 루트에 `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `app/layout.tsx`, `app/globals.css` 추가
- `BLOCKER-2` 해결: `lib/sample-data.ts`의 Demo C 관심 키워드를 `analytics`, `ML`, `statistics`로 조정해 데이터 분석가가 1위로 나오도록 수정

---

## 2. 높음

없음.

### 해결 완료 기록

- `BLOCKER-3` 해결: `components/ResultCard.tsx`에서 `/api/explain` 응답의 `res.ok`를 확인하고, 실패 시 패널을 열지 않고 에러 메시지만 표시하도록 수정
- `BLOCKER-4` 해결: `lib/llm.ts`에서 LLM 응답을 `isExplainResponse()`로 shape 검증 후, 스키마 불일치 시 fallback 설명으로 안전하게 전환

---

## 3. 중간

없음.

### 해결 완료 기록

- `BLOCKER-5` 해결: `lib/llm.ts` 최상단에 `import "server-only";` 추가

---

## 빠르게 고칠 수 있는 항목

해결 완료:

- `docs/TASKS.md` 완료 항목 `[x]` 반영
- 루트 `.gitignore` 생성
- `lib/recommendation.ts` 미사용 import 제거

현재 남아 있는 항목은 데모 블로커가 아니라 운영상 주의사항이다.

- 발표 환경에서 `3000` 포트가 이미 사용 중이면 Next.js가 `3001` 등 다른 포트로 자동 전환될 수 있음
- `OPENAI_API_KEY`가 없어도 fallback은 동작하지만, 실 API 응답 품질은 발표 전에 한 번 더 수동 확인하는 것이 안전함

---

## 최종 데모 가능 여부

| 조건 | 상태 |
|---|---|
| Next.js 앱 실행 | 가능 |
| 데모 A (PM 지향) | 정상 |
| 데모 B (백엔드 지향) | 정상 |
| 데모 C (데이터 지향) | 정상 |
| AI 해설 패널 | 정상 |

**결론**: 현재 기준으로 심사용 데모 가능 상태다.
