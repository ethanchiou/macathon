/**
 * API Client for Lesson Plan Generator
 * Handles all backend communication with auth
 */
import { auth } from './firebase';
import type {
    GenerateRequest,
    GenerateResponse,
    LessonDocument,
    LessonSummary,
    UpdateLessonRequest,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get the current user's ID token
 */
async function getAuthToken(): Promise<string> {
    if (!auth) {
        throw new Error('Firebase not initialized');
    }
    const user = auth.currentUser;
    if (!user) {
        throw new Error('Not authenticated');
    }
    return user.getIdToken();
}

/**
 * Make an authenticated API request
 */
async function fetchWithAuth(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response;
}

/**
 * Generate a new lesson plan
 */
export async function generateLesson(
    request: GenerateRequest
): Promise<GenerateResponse> {
    const response = await fetchWithAuth('/api/generate', {
        method: 'POST',
        body: JSON.stringify(request),
    });
    return response.json();
}

/**
 * Get a lesson by ID
 */
export async function getLesson(lessonId: string): Promise<LessonDocument> {
    const response = await fetchWithAuth(`/api/lessons/${lessonId}`);
    return response.json();
}

/**
 * Update a lesson
 */
export async function updateLesson(
    lessonId: string,
    request: UpdateLessonRequest
): Promise<LessonDocument> {
    const response = await fetchWithAuth(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        body: JSON.stringify(request),
    });
    return response.json();
}

/**
 * List all lessons for the current user
 */
export async function listLessons(): Promise<LessonSummary[]> {
    const response = await fetchWithAuth('/api/lessons');
    return response.json();
}

/**
 * Delete a lesson
 */
export async function deleteLesson(lessonId: string): Promise<void> {
    await fetchWithAuth(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
    });
}

// ============== VIDEO API ==============

import type {
    VideoRequest,
    VideoResponse,
    VideoSummary as VideoSummaryType,
} from '@/types';

/**
 * Generate a new video lesson
 */
export async function generateVideo(
    request: VideoRequest
): Promise<VideoResponse> {
    const response = await fetchWithAuth('/api/generate-video', {
        method: 'POST',
        body: JSON.stringify(request),
    });
    return response.json();
}

/**
 * List all videos for the current user
 */
export async function listVideos(): Promise<VideoSummaryType[]> {
    const response = await fetchWithAuth('/api/videos');
    return response.json();
}

/**
 * Delete a video
 */
export async function deleteVideo(videoId: string): Promise<void> {
    await fetchWithAuth(`/api/videos/${videoId}`, {
        method: 'DELETE',
    });
}
