import { careerMap, courseMap, courses, skillTagLabels } from "./sample-data";
import {
  Career,
  Course,
  DeferredCourse,
  PlanRequest,
  PlanResult,
  PlannedCourse,
  PlannedSemester,
} from "./types";

function termMatches(offeredIn: Course["offeredIn"], semester: "1" | "2") {
  return offeredIn === "both" || offeredIn === semester;
}

function categoryPriority(category: Course["category"]) {
  switch (category) {
    case "major-core":
      return 4;
    case "bridge":
      return 3;
    case "major-elective":
      return 2;
    case "liberal":
      return 1;
  }
}

function getTermSequence(
  nextSemester: "1" | "2",
  semesterCount: 1 | 2
): Array<{ semester: "1" | "2"; termLabel: string }> {
  if (nextSemester === "1") {
    return semesterCount === 1
      ? [{ semester: "1", termLabel: "다음 1학기" }]
      : [
          { semester: "1", termLabel: "다음 1학기" },
          { semester: "2", termLabel: "다음 2학기" },
        ];
  }

  return semesterCount === 1
    ? [{ semester: "2", termLabel: "다음 2학기" }]
    : [
        { semester: "2", termLabel: "다음 2학기" },
        { semester: "1", termLabel: "그다음 1학기" },
      ];
}

function getOwnedTags(courseIds: string[]) {
  return Array.from(
    new Set(
      courseIds
        .map((courseId) => courseMap[courseId])
        .filter(Boolean)
        .flatMap((course) => course.tags)
    )
  );
}

function getPriorityScore(
  course: Course,
  career: Career,
  completedCourseIds: Set<string>,
  missingRequiredTags: string[]
) {
  const isCore = career.coreCourseIds.includes(course.id);
  const fillsRequired = course.tags.filter((tag) =>
    missingRequiredTags.includes(tag)
  ).length;
  const prerequisiteDepth = course.prerequisites?.length ?? 0;

  return {
    isCore,
    fillsRequired,
    categoryPriority: categoryPriority(course.category),
    prerequisiteDepth,
  };
}

function buildCourseReason(course: Course, career: Career, missingRequiredTags: string[]) {
  if (career.coreCourseIds.includes(course.id)) {
    return "선택한 진로의 핵심 과목";
  }

  const matchedMissingTags = course.tags
    .filter((tag) => missingRequiredTags.includes(tag))
    .map((tag) => skillTagLabels[tag] ?? tag);

  if (matchedMissingTags.length > 0) {
    return `${matchedMissingTags.join(", ")} 역량을 직접 보완하는 과목`;
  }

  if (course.category === "liberal") {
    return "학점과 커뮤니케이션 역량을 균형 있게 채우는 과목";
  }

  return "선택한 진로 적합도를 보강하는 과목";
}

function buildWhyNow(
  course: Course,
  semester: "1" | "2",
  completedCourseIds: Set<string>
) {
  if (course.offeredIn === semester) {
    return "다음 학기에 개설되는 과목이라 지금 우선 배치했습니다.";
  }

  if ((course.prerequisites?.length ?? 0) > 0) {
    const ready = course.prerequisites?.every((prerequisite) =>
      completedCourseIds.has(prerequisite)
    );
    if (ready) {
      return "선수과목을 이미 이수해 바로 수강 가능한 상태입니다.";
    }
  }

  return "현재 학점 한도 안에서 우선순위가 높아 이번 학기에 배치했습니다.";
}

function buildDeferredReason(
  course: Course,
  completedCourseIds: Set<string>,
  semesterCount: number
) {
  const unmetPrerequisites = (course.prerequisites ?? []).filter(
    (prerequisite) => !completedCourseIds.has(prerequisite)
  );

  if (unmetPrerequisites.length > 0) {
    return `선수과목(${unmetPrerequisites.join(", ")})을 먼저 이수해야 합니다.`;
  }

  if (semesterCount === 1) {
    return "선택한 학기 수와 학점 한도 안에서 우선순위가 밀려 다음 학기로 이월했습니다.";
  }

  return "개설 학기와 학점 한도를 고려할 때 이번 계획 범위를 넘어 후순위로 보류했습니다.";
}

function buildCreditGapGuidance(
  request: PlanRequest,
  semester: "1" | "2",
  availableCourses: Course[],
  plannedCourseIds: Set<string>,
  completedCourseIds: Set<string>,
  remainingCredits: number
) {
  if (!request.includeLiberalArts || remainingCredits <= 0) {
    return undefined;
  }

  const suggestedCourseIds = availableCourses
    .filter(
      (course) =>
        course.category === "liberal" &&
        !plannedCourseIds.has(course.id) &&
        termMatches(course.offeredIn, semester) &&
        (course.prerequisites ?? []).every((prerequisite) =>
          completedCourseIds.has(prerequisite)
        )
    )
    .slice(0, 2)
    .map((course) => course.id);

  return {
    remainingCredits,
    message:
      suggestedCourseIds.length > 0
        ? `목표 학점까지 ${remainingCredits}학점이 남아 교양 보완 검토를 권장합니다.`
        : `목표 학점까지 ${remainingCredits}학점이 남았지만 현재 데이터셋에서는 같은 학기에 바로 넣을 교양 후보가 부족합니다.`,
    suggestedCourseIds,
  };
}

export function buildPlan(request: PlanRequest): PlanResult {
  const career = careerMap[request.careerId];

  if (!career) {
    throw new Error("선택한 진로를 찾을 수 없습니다.");
  }

  const trackCourses = courses.filter(
    (course) =>
      course.yearTracks.includes(request.studentYearTrack) &&
      !request.takenCourseIds.includes(course.id)
  );

  const availableCourses = trackCourses.filter(
    (course) =>
      request.includeLiberalArts || course.category !== "liberal"
  );

  const coreMissingCourseIds = career.coreCourseIds.filter((courseId) =>
    trackCourses.some((course) => course.id === courseId)
  );

  const completedCourseIds = new Set(request.takenCourseIds);
  const plannedCourseIds = new Set<string>();
  const termSequence = getTermSequence(
    request.nextSemester,
    request.semesterCount
  );

  const semesters: PlannedSemester[] = termSequence.map((term) => {
    const ownedTags = getOwnedTags(Array.from(completedCourseIds));
    const missingRequiredTags = career.requiredTags.filter(
      (tag) => !ownedTags.includes(tag)
    );
    const selectedCourses: PlannedCourse[] = [];
    let totalCredits = 0;

    const sortedCandidates = availableCourses
      .filter(
        (course) =>
          !plannedCourseIds.has(course.id) &&
          termMatches(course.offeredIn, term.semester) &&
          (course.prerequisites ?? []).every((prerequisite) =>
            completedCourseIds.has(prerequisite)
          )
      )
      .sort((a, b) => {
        const aScore = getPriorityScore(
          a,
          career,
          completedCourseIds,
          missingRequiredTags
        );
        const bScore = getPriorityScore(
          b,
          career,
          completedCourseIds,
          missingRequiredTags
        );

        if (aScore.isCore !== bScore.isCore) {
          return Number(bScore.isCore) - Number(aScore.isCore);
        }

        if (aScore.fillsRequired !== bScore.fillsRequired) {
          return bScore.fillsRequired - aScore.fillsRequired;
        }

        if (aScore.categoryPriority !== bScore.categoryPriority) {
          return bScore.categoryPriority - aScore.categoryPriority;
        }

        if (aScore.prerequisiteDepth !== bScore.prerequisiteDepth) {
          return aScore.prerequisiteDepth - bScore.prerequisiteDepth;
        }

        return a.code.localeCompare(b.code);
      });

    for (const course of sortedCandidates) {
      if (totalCredits + course.credits > request.targetCredits) {
        continue;
      }

      selectedCourses.push({
        courseId: course.id,
        name: course.name,
        credits: course.credits,
        reason: buildCourseReason(course, career, missingRequiredTags),
        whyNow: buildWhyNow(course, term.semester, completedCourseIds),
      });
      totalCredits += course.credits;
      plannedCourseIds.add(course.id);
    }

    selectedCourses.forEach((course) => completedCourseIds.add(course.courseId));
    const remainingCredits = Math.max(request.targetCredits - totalCredits, 0);
    const creditGapGuidance = buildCreditGapGuidance(
      request,
      term.semester,
      availableCourses,
      plannedCourseIds,
      completedCourseIds,
      remainingCredits
    );

    return {
      termLabel: term.termLabel,
      totalCredits,
      remainingCredits,
      courses: selectedCourses,
      creditGapGuidance,
    };
  });

  const deferredCourses: DeferredCourse[] = coreMissingCourseIds
    .filter((courseId) => !plannedCourseIds.has(courseId))
    .map((courseId) => {
      const course = courseMap[courseId];
      return {
        courseId,
        reason: buildDeferredReason(
          course,
          completedCourseIds,
          request.semesterCount
        ),
      };
    });

  return {
    selectedCareer: {
      careerId: career.id,
      careerName: career.name,
      summary: career.summary,
    },
    coreMissingCourseIds,
    semesters,
    deferredCourses,
  };
}
