export type Course = {
  id: string;
  code: string;
  name: string;
  credits: number;
  yearTracks: string[];
  offeredIn: "1" | "2" | "both";
  category: "major-core" | "major-elective" | "bridge" | "liberal";
  majors: string[];
  tags: string[];
  description: string;
  prerequisites?: string[];
};

export type Career = {
  id: string;
  name: string;
  summary: string;
  requiredTags: string[];
  optionalTags: string[];
  coreCourseIds: string[];
  preferredMajors?: string[];
  keywordAliases?: string[];
};

export type StudentProfile = {
  studentYearTrack: string;
  primaryMajor: string;
  secondaryMajor?: string;
  takenCourseIds: string[];
  interestKeywords: string[];
};

export type ScoreBreakdown = {
  requiredTagScore: number;
  optionalTagScore: number;
  keywordBonus: number;
  primaryMajorBonus: number;
  secondaryMajorBonus: number;
  evidencePenalty: number;
  requiredCoveragePct: number;
  optionalCoveragePct: number;
  relatedCourseCount: number;
  total: number;
};

export type CareerRecommendation = {
  careerId: string;
  careerName: string;
  score: number;
  summary: string;
  reasonSummary: string;
  scoreBreakdown: ScoreBreakdown;
  matchedTags: string[];
  missingTags: string[];
  strengthHighlights: string[];
  gapHighlights: string[];
  reasons: string[];
  coreMissingCourseIds: string[];
  recommendedCourseIds: string[];
  evidenceCourseCount: number;
  confidenceLabel: "낮음" | "보통" | "높음";
  confidenceReason: string;
};

export type DemoProfile = {
  label: string;
  description: string;
  profile: StudentProfile;
};

export type ExplainRequest = {
  recommendation: CareerRecommendation;
  profile: StudentProfile;
};

export type RecommendApiResponse =
  | {
      results: CareerRecommendation[];
    }
  | {
      error: string;
    };

export type PlanRequest = StudentProfile & {
  careerId: string;
  targetCredits: 12 | 15 | 18;
  semesterCount: 1 | 2;
  includeLiberalArts: boolean;
  nextSemester: "1" | "2";
};

export type PlanOptions = Pick<
  PlanRequest,
  "nextSemester" | "targetCredits" | "semesterCount" | "includeLiberalArts"
>;

export type PlannedCourse = {
  courseId: string;
  name: string;
  credits: number;
  reason: string;
  whyNow: string;
};

export type CreditGapGuidance = {
  remainingCredits: number;
  message: string;
  suggestedCourseIds: string[];
};

export type PlannedSemester = {
  termLabel: string;
  totalCredits: number;
  remainingCredits: number;
  courses: PlannedCourse[];
  creditGapGuidance?: CreditGapGuidance;
};

export type DeferredCourse = {
  courseId: string;
  reason: string;
};

export type PlanResult = {
  selectedCareer: {
    careerId: string;
    careerName: string;
    summary: string;
  };
  coreMissingCourseIds: string[];
  semesters: PlannedSemester[];
  deferredCourses: DeferredCourse[];
};

export type PlanApiResponse =
  | {
      result: PlanResult;
    }
  | {
      error: string;
    };

export type RoadmapPhase = {
  phase: number;
  title: string;
  description: string;
  courseIds: string[];
};

export type ExplainResponse = {
  headline: string;
  fitSummary: string;
  evidence: string[];
  caution: string;
  roadmap: RoadmapPhase[];
};

export type ExplainApiResponse =
  | ExplainResponse
  | {
      error: string;
    };
