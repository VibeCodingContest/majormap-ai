export type Course = {
  id: string;
  code: string;
  name: string;
  yearTracks: string[];
  majors: string[];
  tags: string[];
  description: string;
};

export type Career = {
  id: string;
  name: string;
  summary: string;
  requiredTags: string[];
  optionalTags: string[];
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
  majorComboBonus: number;
  total: number;
};

export type CareerRecommendation = {
  careerId: string;
  careerName: string;
  score: number;
  summary: string;
  scoreBreakdown: ScoreBreakdown;
  matchedTags: string[];
  missingTags: string[];
  reasons: string[];
  recommendedCourseIds: string[];
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
