/**
 * Lesson Plan Types
 * Matches the strict schema from the backend
 */

export interface PriorKnowledgeRecap {
    bullets: string[];
    quickCheckQuestions: string[];
}

export interface Misconception {
    misconception: string;
    correction: string;
    checkQuestion: string;
}

export interface Activity {
    title: string;
    timeMinutes: number;
    materials: string[];
    steps: string[];
    teacherPrompts: string[];
    expectedStudentResponses: string[];
}

export interface Differentiation {
    strugglingLearners: string[];
    advancedLearners: string[];
    languageLearners: string[];
}

export interface LessonPlan {
    title: string;
    gradeBand: "6-8" | "9-10" | "11-12";
    region: string;
    durationMinutes: number;
    learningGoals: string[];
    priorKnowledgeRecap: PriorKnowledgeRecap;
    coreExplanation: string[];
    commonMisconceptions: Misconception[];
    activity: Activity;
    exitTicket: string[];
    differentiation: Differentiation;
    localContextExamples: string[];
}

export interface GenerateRequest {
    region: string;
    gradeBand: "6-8" | "9-10" | "11-12";
    durationMinutes: 20 | 60;
    topicPrompt: string;
}

export interface GenerateResponse {
    lessonId: string;
    lessonPlan: LessonPlan;
}

export interface LessonDocument {
    id: string;
    ownerUid: string;
    region: string;
    gradeBand: string;
    durationMinutes: number;
    topicPrompt: string;
    createdAt: string;
    updatedAt: string;
    lessonPlanJson: LessonPlan;
}

export interface LessonSummary {
    id: string;
    title: string;
    region: string;
    gradeBand: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateLessonRequest {
    lessonPlan: LessonPlan;
}

export const REGIONS = [
    "Kenya",
    "Nigeria",
    "Ghana",
    "South Africa",
    "India",
    "Philippines",
    "Brazil",
    "Mexico",
    "Indonesia",
    "Bangladesh",
    "Other"
] as const;

export const GRADE_BANDS = ["6-8", "9-10", "11-12"] as const;
export const DURATIONS = [20, 60] as const;
