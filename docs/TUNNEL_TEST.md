# TUNNEL TEST

이 문서는 `majormap-ai`를 `trycloudflare.com` 임시 링크로 친구에게 공유할 때 쓰는 운영 절차다.  
오늘 목적은 Vercel 배포가 아니라, `next start` 기반 production 서버를 Cloudflare Tunnel로 안전하게 노출하는 것이다.

---

## 왜 `localhost`를 친구에게 그대로 줄 수 없는가

- `localhost`는 내 컴퓨터를 의미하므로, 친구의 브라우저에서는 내 앱이 아니라 친구 자신의 컴퓨터를 가리킨다.
- 따라서 친구에게는 반드시 `trycloudflare.com` 같은 외부 접근 가능한 임시 URL을 보내야 한다.

---

## 왜 `npm run dev`가 아니라 `npm run build` + `npm run start`인가

- `npm run dev`는 개발용 HMR과 디버그 자산을 포함한다.
- 친구가 dev 링크를 보면 `/_next/webpack-hmr` 같은 요청이 남아 터널에서 이상하게 보일 수 있다.
- `npm run build` + `npm run start`는 production 서버라서 dev 세션 잔재를 줄이고, 친구 피드백용 임시 링크를 더 안정적으로 만든다.

---

## 전체 재실행 절차

1. 기존 `next dev`, `next start`, `cloudflared` 프로세스를 모두 종료한다.
2. 프로젝트 루트에서 `.next`를 삭제한다.
3. `npm run build`를 실행한다.
4. `npm run start`를 실행한다.
5. `http://localhost:3000`이 `200`인지 확인한다.
6. 새 터널을 만든다.
   ```powershell
   & "C:\Users\rlatj\AppData\Local\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe" tunnel --url http://localhost:3000
   ```
7. 출력된 새 `trycloudflare.com` 링크만 친구에게 보낸다.
8. 테스트 브라우저는 시크릿 창에서 연다.
9. 예전 링크, 예전 탭, 예전 터널 주소는 모두 닫는다.

---

## 시크릿 창을 쓰는 이유

- 기존 브라우저 캐시를 최대한 피할 수 있다.
- 이전 `trycloudflare` 탭이 들고 있던 오래된 JS 번들을 피할 수 있다.
- 세션 쿠키나 저장된 상태가 남아 있어도 새 창에서 최소화할 수 있다.

---

## 페이지별 확인 절차

- `/` 접속 후 첫 화면이 바로 보이는지 확인한다.
- `/recommend`로 이동해 데모 A/B/C 버튼이 보이는지 확인한다.
- `진로 추천 받기`를 눌러 `POST /api/recommend`가 성공하는지 확인한다.
- 결과 카드에서 `이 진로로 계획 짜기`를 눌러 `POST /api/plan`이 성공하는지 확인한다.
- `AI 해설 보기`를 눌러 `POST /api/explain`이 성공하는지 확인한다.

---

## Network 탭에서 확인할 포인트

- 요청 URL이 `localhost`가 아니라 현재 `trycloudflare` 도메인인지 확인한다.
- `GET /`는 `200`인지 확인한다.
- `POST /api/recommend`, `POST /api/plan`, `POST /api/explain`가 `200`인지 확인한다.
- `/_next/webpack-hmr` 요청이 보이면 dev 세션 또는 예전 탭을 보고 있는 것이다.
- 응답 타입이 `JSON`인지, 에러가 나면 `HTML` 에러 페이지인지 구분한다.

---

## 실패했을 때 우선 확인할 것

1. 친구가 예전 링크를 열고 있지 않은지 확인한다.
2. 브라우저에 남아 있는 예전 탭을 모두 닫는다.
3. `next dev`가 같이 떠 있지 않은지 확인한다.
4. `npm run start`가 `3000`에서 정상 응답하는지 다시 확인한다.
5. 새 `cloudflared` 프로세스가 이전 터널을 재사용하지 않는지 확인한다.

---

## 친구에게 링크 보내기 전 체크리스트

- `npm run build`가 통과했는가
- `npm run start`가 `3000`에서 떠 있는가
- 새 `trycloudflare.com` 주소를 방금 받았는가
- 이전 터널 링크를 공유하지 않았는가
- 친구에게 시크릿 창으로 열어달라고 안내했는가

---

## 운영 메모

- 이 문서는 오늘의 임시 피드백 공유 절차용이다.
- 정식 외부 공유는 Vercel preview/live URL로 옮긴다.
- `trycloudflare.com` 링크는 장기 배포 주소로 쓰지 않는다.
