# FINAL CHECKLIST

제출 직전에 확인할 최소 체크리스트다.

---

## 코드/실행

- [ ] `npm install` 완료
- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] `/recommend` 진입 가능
- [ ] 추천 결과 Top 3 렌더링 확인
- [ ] `AI 해설 보기` 클릭 가능
- [ ] explain fallback 동작 확인

## 배포 확인

- [ ] Vercel Production 배포 성공
- [ ] live URL에서 `/` 접속 확인
- [ ] live URL에서 `/recommend` 진입 확인
- [ ] `docs/PROD_QA.md` 순서대로 최종 수동 점검 완료
- [ ] 모바일 최소 화면 폭에서 입력/결과 레이아웃 확인

## 환경변수

- [ ] `.env`, `.env.local`, `.env*.local` 미추적 확인
- [ ] `OPENAI_API_KEY`는 선택값으로만 문서화
- [ ] Vercel 환경변수 설정 여부 확인
- [ ] API 키가 없어도 추천 핵심 흐름 유지 확인

## 문서

- [ ] `README.md` 최신화 완료
- [ ] `docs/README.md` 문서 인덱스 확인
- [ ] `docs/STATUS_HANDOFF.md` 최신 상태 반영
- [ ] `docs/AI_COLLAB.md` 최신 작업 로그 반영
- [ ] `docs/AI_REPORT_DRAFT.md` 확인 완료
- [ ] `docs/JUDGE_ONE_PAGER.md` 확인 완료
- [ ] `docs/SUBMISSION_GUIDE.md` 확인 완료

## 보안/공개 저장소

- [ ] 실제 API 키/토큰 하드코딩 없음 확인
- [ ] public repo에 올리면 안 되는 개인정보/로그/빌드 산출물 제외 확인
- [ ] 제출 직전 `git status` 확인
- [ ] `초기설계안` 폴더가 legacy로 분리되었는지 확인

## 브랜치 / 머지 / 푸시

- [ ] `main` 직접 작업 금지 원칙 유지
- [ ] feature branch -> PR -> merge 흐름 준수
- [ ] 마지막 merge/push 시점 기록
- [ ] 제출 직전 불필요한 로컬 변경 없음

## 제출물

- [ ] public repo URL 준비
- [ ] live URL 준비
- [ ] AI report PDF 준비
- [ ] 개인정보 수집/이용 동의서 준비
- [ ] 참가 각서 준비
- [ ] 제출 메일 회신 순서 확인
