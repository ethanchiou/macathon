'use client';

/**
 * Library Page
 * Lists all saved lesson plans for the current user
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { listLessons } from '@/lib/api';
import type { LessonSummary } from '@/types';

export default function LibraryPage() {
    const { user, loading: authLoading, signInWithGoogle } = useAuth();

    const [lessons, setLessons] = useState<LessonSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && !authLoading) {
            fetchLessons();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const fetchLessons = async () => {
        try {
            const data = await listLessons();
            setLessons(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load lessons');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Loading state
    if (authLoading || loading) {
        return (
            <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your library...</p>
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
                    <p className="text-gray-600 mb-6">
                        Please sign in to view your saved lesson plans
                    </p>
                    <button
                        onClick={signInWithGoogle}
                        className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                        Sign in with Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-72px)] py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Lesson Library</h1>
                        <p className="text-gray-600 mt-1">
                            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} saved
                        </p>
                    </div>
                    <Link
                        href="/create"
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg flex items-center gap-2"
                    >
                        <span>+</span>
                        Create New
                    </Link>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
                        <span className="font-medium">Error:</span> {error}
                    </div>
                )}

                {/* Empty State */}
                {lessons.length === 0 && !error && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <span className="text-6xl mb-4 block">📚</span>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            No lessons yet
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Create your first lesson plan to get started
                        </p>
                        <Link
                            href="/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                        >
                            🧪 Create Lesson Plan
                        </Link>
                    </div>
                )}

                {/* Lesson Grid */}
                {lessons.length > 0 && (
                    <div className="grid gap-4">
                        {lessons.map((lesson) => (
                            <Link
                                key={lesson.id}
                                href={`/lesson/${lesson.id}`}
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex items-center gap-6"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-2xl shrink-0">
                                    🧬
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h3 className="text-lg font-bold text-gray-800 truncate">
                                        {lesson.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            📍 {lesson.region}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            📚 Grades {lesson.gradeBand}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-400 text-right shrink-0">
                                    <div>Created</div>
                                    <div className="font-medium text-gray-600">
                                        {formatDate(lesson.createdAt)}
                                    </div>
                                </div>
                                <div className="text-gray-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
