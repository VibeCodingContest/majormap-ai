# SUBMISSION GUIDE

이 문서는 `majormap-ai` canonical repo 기준 공모전 제출 직전 필요한 제출물과 확인 순서를 정리한다.

---

## 1. 제출물 목록

- public repo URL
- live URL
- AI report PDF
- 개인정보 수집/이용 동의서
- 참가 각서

## 2. 저장소

- 제출용 저장소는 `public repo` 기준으로 준비한다.
- `main`은 안정 브랜치로 유지하고, 실제 작업은 feature 브랜치에서 정리 후 병합한다.
- public repo에는 `.env`, `.env.local`, `.env*.local`, 개인 로그, 빌드 산출물을 올리지 않는다.
- `초기설계안`은 legacy 폴더로 분리하고 source of truth로 사용하지 않는다.

## 3. live URL

- 제출 전에 실제 접근 가능한 live URL을 준비한다.
- 첫 화면과 `/recommend`가 정상 동작해야 한다.
- `OPENAI_API_KEY`가 없어도 추천 핵심 흐름은 유지되어야 한다.

## 4. AI report PDF

- 어떤 AI 도구를 어떤 범위에 사용했는지 요약한 PDF를 준비한다.
- `docs/AI_REPORT_DRAFT.md` 내용을 기준으로 정리한다.
- AI가 생성한 내용과 사람이 직접 검토한 판단을 분리해서 적는다.

## 5. 필수 서류

- 개인정보 수집/이용 동의서
- 참가 각서

서류 파일명, 서명 여부, 제출 형식은 공모전 공지와 일치해야 한다.

## 6. 제출 순서

1. `main`이 최신 상태인지 확인
2. `npm run lint`와 `npm run build` 재실행
3. live URL Production 배포 확인
4. `docs/FINAL_CHECKLIST.md` 체크 완료
5. 제출물 첨부 후 메일 회신

## 7. 제출 메일 회신 순서

1. public repo URL 정리
2. live URL 정리
3. AI report PDF 첨부
4. 개인정보 수집/이용 동의서 첨부
5. 참가 각서 첨부
6. 메일 본문에 팀명/작품명/핵심 설명 점검
7. 마지막으로 링크 오타와 첨부 누락 재확인 후 회신

## 8. 제출 직전 commit / branch 확인 항목

- 현재 브랜치가 `main` 또는 제출 직전 승인된 release 기준 브랜치인지 확인
- feature 브랜치의 미병합 변경이 남아 있지 않은지 확인
- 마지막 merge 이후 추가 로컬 수정이 없는지 확인
- `git status`가 깨끗한 상태인지 확인
- public repo에 노출되면 안 되는 파일이 staged 상태가 아닌지 확인

## 9. public repo 업로드 시 위험 요소

- `.env` 계열 파일이 포함되면 즉시 보안 이슈가 된다.
- README와 실제 기능이 불일치하면 심사 신뢰도가 떨어진다.
- live URL에서 explain 실패가 전체 흐름을 막으면 제출 완성도가 낮아진다.
- 불필요한 커밋 기록에 개인 정보나 내부 메모가 섞이지 않도록 주의한다.
