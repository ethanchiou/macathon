'use client';

/**
 * Lesson View Page
 * Displays and allows editing of a specific lesson plan
 */
import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { LessonViewer } from '@/components/LessonViewer';
import { getLesson, updateLesson } from '@/lib/api';
import type { LessonDocument, LessonPlan } from '@/types';

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [lesson, setLesson] = useState<LessonDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLesson = useCallback(async () => {
        try {
            const data = await getLesson(resolvedParams.id);
            setLesson(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load lesson');
        } finally {
            setLoading(false);
        }
    }, [resolvedParams.id]);

    useEffect(() => {
        if (user && !authLoading) {
            fetchLesson();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading, fetchLesson]);

    const handleSave = async (lessonPlan: LessonPlan) => {
        setSaving(true);
        try {
            const updated = await updateLesson(resolvedParams.id, { lessonPlan });
            setLesson(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save lesson');
        } finally {
            setSaving(false);
        }
    };

    // Loading state
    if (authLoading || loading) {
        return (
            <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading lesson plan...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return (
            <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <span className="text-6xl mb-4 block">🔐</span>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Sign In Required
                    </h1>
                    <p className="text-gray-600">
                        Please sign in to view this lesson plan
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <span className="text-6xl mb-4 block">❌</span>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Error Loading Lesson
                    </h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/library')}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    // Lesson not found
    if (!lesson) {
        return (
            <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <span className="text-6xl mb-4 block">📭</span>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Lesson Not Found
                    </h1>
                    <p className="text-gray-600 mb-6">
                        This lesson may have been deleted or you don&apos;t have access.
                    </p>
                    <button
                        onClick={() => router.push('/library')}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-72px)] py-8 px-4">
            <div className="max-w-4xl mx-auto mb-6">
                <button
                    onClick={() => router.push('/library')}
                    className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Library
                </button>
            </div>
            <LessonViewer
                lessonPlan={lesson.lessonPlanJson}
                onSave={handleSave}
                saving={saving}
            />
        </div>
    );
}
