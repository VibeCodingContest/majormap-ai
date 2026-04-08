# GitHub Setup

## Organization

- 이름: `VibeCodingContest`

## Repository

- 우선 저장소 이름: `majormap-ai`
- 대체 저장소 이름: `kit-majormap-ai`
- 기본 브랜치: `main`

## 첫 배포 전 체크 항목

- `npm run lint` 통과
- `npm run build` 통과
- `.env.local` 미추적 확인
- `.gitignore`에 `.env.local`, `.env*.local`, `node_modules/`, `.next/` 포함 확인
- `docs/DEMO_BLOCKERS.md`가 해결 완료 상태인지 확인
- `README.md`, `docs/DEMO_SCRIPT.md`, `docs/TASKS.md` 내용이 현재 구현과 일치하는지 확인
- 데모 A/B/C가 각각 기대한 1위 진로를 반환하는지 확인

## Push 이후 확인할 URL

- 우선 시도 URL: `https://github.com/VibeCodingContest/majormap-ai`
- 이름 충돌 시 URL: `https://github.com/VibeCodingContest/kit-majormap-ai`
