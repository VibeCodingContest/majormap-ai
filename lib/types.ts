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
  gradingType?: "standard" | "fp";
  isCore?: boolean;
  isMajorImportant?: boolean;
  retakeThreshold?: GradeValue;
  prerequisites?: string[];
};

export type CertificationRecommendation = {
  name: string;
  reason: string;
  priority?: "high" | "medium" | "low";
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
  recommendedCertifications?: CertificationRecommendation[];
};

export type GradeValue =
  | "A+"
  | "A0"
  | "B+"
  | "B0"
  | "C+"
  | "C0"
  | "D+"
  | "D0"
  | "F"
  | "P";

export type TakenCourseInput = {
  courseId: string;
  grade?: GradeValue;
};

export type StudentProfile = {
  studentYearTrack: string;
  primaryMajor: string;
  secondaryMajor?: string;
  takenCourses: TakenCourseInput[];
  takenCourseIds: string[];
  interestKeywords: string[];
};

export type ScoreBreakdown = {
  requiredCoverage: number;
  optionalCoverage: number;
  majorFitBonus: number;
  keywordBonus: number;
  gradeAdjustment?: number;
  evidencePenaltyMultiplier: number;
  relatedCourseCount: number;
  total: number;
};

export type ScoreAdjustment = {
  reason: string;
  delta: number;
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
  confidenceLevel?: "low" | "medium" | "high";
  confidenceLabel: "낮음" | "보통" | "높음";
  confidenceReason: string;
  lowGradeWarnings: string[];
  retakeRecommendations: string[];
  retakeCourseIds: string[];
  recommendationNotes: string[];
  recommendedCertifications: CertificationRecommendation[];
  scoreAdjustments?: ScoreAdjustment[];
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

export type TargetCredits =
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21;

export type PlanRequest = StudentProfile & {
  careerId: string;
  targetCredits: TargetCredits;
  firstSemesterTargetCredits?: TargetCredits;
  secondSemesterTargetCredits?: TargetCredits;
  semesterCount: 1 | 2;
  includeLiberalArts: boolean;
  includeRetakeCourses?: boolean;
  retakeCourseIds?: string[];
  nextSemester: "1" | "2";
};

export type PlanOptions = Pick<
  PlanRequest,
  | "nextSemester"
  | "targetCredits"
  | "firstSemesterTargetCredits"
  | "secondSemesterTargetCredits"
  | "semesterCount"
  | "includeLiberalArts"
>;

export type PlannedCourse = {
  courseId: string;
  name: string;
  credits: number;
  reason: string;
  whyNow: string;
  isRetake?: boolean;
};

export type CreditGapGuidance = {
  remainingCredits: number;
  message: string;
  suggestedCourseIds: string[];
};

export type PlannedSemester = {
  termLabel: string;
  targetCredits: TargetCredits;
  totalCredits: number;
  remainingCredits: number;
  courses: PlannedCourse[];
  retakeUnavailableNotes?: string[];
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
  retakeRecommendations: string[];
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
