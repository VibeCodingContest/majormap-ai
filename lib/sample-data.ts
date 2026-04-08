import { Career, Course, DemoProfile } from "./types";

export const courses: Course[] = [
  // 컴퓨터공학 공통 (2023/2024)
  {
    id: "cs101",
    code: "CS101",
    name: "프로그래밍입문",
    yearTracks: ["2023", "2024"],
    majors: ["컴퓨터공학"],
    tags: ["programming", "problem-solving"],
    description: "기초 프로그래밍과 문제 해결 역량을 학습한다.",
  },
  {
    id: "cs201",
    code: "CS201",
    name: "데이터구조",
    yearTracks: ["2023", "2024"],
    majors: ["컴퓨터공학"],
    tags: ["algorithms", "problem-solving"],
    description: "자료구조와 알고리즘 기초를 다룬다.",
  },
  {
    id: "cs301",
    code: "CS301",
    name: "운영체제",
    yearTracks: ["2023", "2024"],
    majors: ["컴퓨터공학"],
    tags: ["algorithms", "system-design"],
    description: "운영체제의 프로세스, 메모리, 파일 시스템을 다룬다.",
  },
  {
    id: "cs302",
    code: "CS302",
    name: "데이터베이스",
    yearTracks: ["2023", "2024"],
    majors: ["컴퓨터공학"],
    tags: ["programming", "data-analysis", "system-design"],
    description: "관계형 DB 설계와 SQL 쿼리 최적화를 학습한다.",
  },
  {
    id: "cs401",
    code: "CS401",
    name: "소프트웨어공학",
    yearTracks: ["2023", "2024"],
    majors: ["컴퓨터공학"],
    tags: ["system-design", "communication", "problem-solving"],
    description: "요구사항 분석, 설계 패턴, 팀 협업 방법론을 다룬다.",
  },
  // 컴퓨터공학 2024 전용 신설 과목
  {
    id: "cs202",
    code: "CS202",
    name: "알고리즘설계",
    yearTracks: ["2024"],
    majors: ["컴퓨터공학"],
    tags: ["algorithms", "problem-solving"],
    description: "2024 트랙 전용 알고리즘 심화 과목.",
  },
  {
    id: "cs402",
    code: "CS402",
    name: "클라우드컴퓨팅",
    yearTracks: ["2024"],
    majors: ["컴퓨터공학"],
    tags: ["system-design", "programming"],
    description: "2024 트랙 전용. AWS/GCP 기반 클라우드 인프라를 다룬다.",
  },
  // 경영학 공통
  {
    id: "biz101",
    code: "BIZ101",
    name: "경영학원론",
    yearTracks: ["2023", "2024"],
    majors: ["경영학"],
    tags: ["business", "strategy"],
    description: "경영 전반의 기본 개념을 학습한다.",
  },
  {
    id: "biz210",
    code: "BIZ210",
    name: "마케팅",
    yearTracks: ["2023", "2024"],
    majors: ["경영학"],
    tags: ["marketing", "communication"],
    description: "시장 분석과 마케팅 전략 수립을 다룬다.",
  },
  {
    id: "biz301",
    code: "BIZ301",
    name: "경영전략",
    yearTracks: ["2023", "2024"],
    majors: ["경영학"],
    tags: ["strategy", "business", "communication"],
    description: "기업의 경쟁 전략 수립과 사례 분석을 다룬다.",
  },
  {
    id: "biz302",
    code: "BIZ302",
    name: "IT프로젝트관리",
    yearTracks: ["2023", "2024"],
    majors: ["경영학"],
    tags: ["strategy", "communication", "problem-solving"],
    description: "IT 프로젝트의 범위·일정·리스크 관리를 다룬다.",
  },
  // 데이터/분석 과목
  {
    id: "ie301",
    code: "IE301",
    name: "데이터분석개론",
    yearTracks: ["2023", "2024"],
    majors: ["컴퓨터공학", "경영학"],
    tags: ["data-analysis", "statistics"],
    description: "데이터 분석 및 통계 기반 의사결정을 다룬다.",
  },
  {
    id: "ie302",
    code: "IE302",
    name: "통계학",
    yearTracks: ["2023", "2024"],
    majors: ["경영학", "컴퓨터공학"],
    tags: ["statistics", "data-analysis"],
    description: "기초 통계와 확률론, 회귀 분석을 다룬다.",
  },
  {
    id: "ie401",
    code: "IE401",
    name: "머신러닝기초",
    yearTracks: ["2024"],
    majors: ["컴퓨터공학"],
    tags: ["data-analysis", "algorithms", "statistics"],
    description: "2024 트랙 전용. 지도/비지도 학습 기초를 다룬다.",
  },
  // 컨설팅 관련
  {
    id: "biz401",
    code: "BIZ401",
    name: "비즈니스컨설팅",
    yearTracks: ["2023", "2024"],
    majors: ["경영학"],
    tags: ["consulting", "strategy", "communication"],
    description: "기업 문제 진단 및 솔루션 제안 방법론을 다룬다.",
  },
];

export const careers: Career[] = [
  {
    id: "backend",
    name: "백엔드 개발자",
    summary: "서버와 데이터 흐름을 설계하고 안정적인 서비스 로직을 구현한다.",
    requiredTags: ["programming", "algorithms"],
    optionalTags: ["system-design", "data-analysis", "problem-solving"],
  },
  {
    id: "pm",
    name: "프로덕트 매니저",
    summary: "기술과 비즈니스를 연결해 제품 방향과 기능 우선순위를 설계한다.",
    requiredTags: ["business", "strategy", "communication"],
    optionalTags: ["programming", "data-analysis", "problem-solving"],
  },
  {
    id: "data-analyst",
    name: "데이터 분석가",
    summary: "데이터를 기반으로 문제를 해석하고 인사이트를 도출한다.",
    requiredTags: ["data-analysis", "statistics"],
    optionalTags: ["programming", "business", "algorithms"],
  },
  {
    id: "consultant",
    name: "솔루션 컨설턴트",
    summary:
      "기업의 기술·경영 문제를 진단하고 IT 기반 솔루션을 제안한다.",
    requiredTags: ["consulting", "strategy", "communication"],
    optionalTags: ["business", "system-design", "data-analysis"],
  },
];

export const demoProfiles: DemoProfile[] = [
  {
    label: "A — PM 지향 (2024 컴공+경영)",
    description: "2024학번, 컴공+경영 복수전공. 비즈니스·전략·커뮤니케이션 과목 위주 수강.",
    profile: {
      studentYearTrack: "2024",
      primaryMajor: "컴퓨터공학",
      secondaryMajor: "경영학",
      takenCourseIds: ["cs101", "biz101", "biz210", "biz301", "biz302"],
      interestKeywords: ["product", "strategy", "UX"],
    },
  },
  {
    label: "B — 백엔드 지향 (2023 컴공 중심)",
    description: "2023학번, 컴공 단일전공. 프로그래밍·알고리즘·시스템 과목 집중 수강.",
    profile: {
      studentYearTrack: "2023",
      primaryMajor: "컴퓨터공학",
      secondaryMajor: undefined,
      takenCourseIds: ["cs101", "cs201", "cs301", "cs302", "cs401"],
      interestKeywords: ["backend", "server", "API"],
    },
  },
  {
    label: "C — 데이터 지향 (2024 컴공+경영)",
    description: "2024학번, 컴공+경영 복수전공. 데이터·통계·알고리즘 과목 위주 수강.",
    profile: {
      studentYearTrack: "2024",
      primaryMajor: "컴퓨터공학",
      secondaryMajor: "경영학",
      takenCourseIds: ["cs101", "cs201", "ie301", "ie302", "ie401"],
      interestKeywords: ["analytics", "ML", "statistics"],
    },
  },
];

// 과목 ID → Course 빠른 조회
export const courseMap: Record<string, Course> = Object.fromEntries(
  courses.map((c) => [c.id, c])
);

// 진로 ID → Career 빠른 조회
export const careerMap: Record<string, Career> = Object.fromEntries(
  careers.map((c) => [c.id, c])
);

// 스킬 태그 한국어 레이블
export const skillTagLabels: Record<string, string> = {
  programming: "프로그래밍",
  algorithms: "알고리즘",
  "problem-solving": "문제해결",
  "system-design": "시스템설계",
  "data-analysis": "데이터분석",
  statistics: "통계",
  business: "비즈니스",
  strategy: "전략",
  communication: "커뮤니케이션",
  marketing: "마케팅",
  consulting: "컨설팅",
};
