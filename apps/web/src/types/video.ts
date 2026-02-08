/**
 * Video Lesson Types
 * Matches the schema from the backend
 */

export interface Slide {
    slideNumber: number;
    title: string;
    narration: string;
    imagePrompt: string;
    keyPoints: string[];
}

export interface VideoScript {
    title: string;
    slides: Slide[];
}

export interface VideoRequest {
    topic: string;
    gradeBand: "6-8" | "9-10" | "11-12";
    region: string;
    slideCount: number;
}

export interface VideoResponse {
    videoId: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    durationSeconds: number;
}

export interface VideoDocument {
    id: string;
    ownerUid: string;
    topic: string;
    gradeBand: string;
    region: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    durationSeconds: number;
    createdAt: string;
    script?: VideoScript;
}

export interface VideoSummary {
    id: string;
    title: string;
    topic: string;
    gradeBand: string;
    thumbnailUrl: string;
    durationSeconds: number;
    createdAt: string;
}

export const SLIDE_COUNTS = [3, 4, 5, 6, 7, 8] as const;
