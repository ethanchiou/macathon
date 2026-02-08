'use client';

/**
 * Create Lesson Page
 * Form for generating new lesson plans
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { generateLesson } from '@/lib/api';
import { REGIONS, GRADE_BANDS, DURATIONS, type GenerateRequest } from '@/types';

export default function CreateLessonPage() {
    const router = useRouter();
    const { user, loading: authLoading, signInWithGoogle } = useAuth();

    const [formData, setFormData] = useState<GenerateRequest>({
        region: 'Kenya',
        gradeBand: '6-8',
        durationMinutes: 20,
        topicPrompt: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.topicPrompt.trim()) {
            setError('Please enter a topic prompt');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await generateLesson(formData);
            router.push(`/lesson/${response.lessonId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate lesson');
            setLoading(false);
        }
    };

    // Show loading state
    if (authLoading) {
        return (
            <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    // Show sign-in prompt if not authenticated
    if (!user) {
        return (
            <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <span className="text-6xl mb-4 block">🔐</span>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Sign In Required
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Please sign in to create lesson plans
                    </p>
                    <button
                        onClick={signInWithGoogle}
                        className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                        </svg>
                        Sign in with Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-72px)] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="school-card overflow-hidden text-gray-900">
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-8 border-b border-slate-700">
                        <h1 className="text-3xl font-bold mb-2 !text-white">Generate Lesson Plan</h1>
                        <p className="text-slate-400">
                            Fill in the details below to generate a structured STEM lesson plan
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Region */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🌍 Region / Country
                            </label>
                            <select
                                value={formData.region}
                                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                            >
                                {REGIONS.map((region) => (
                                    <option key={region} value={region}>
                                        {region}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-sm text-gray-500">
                                We&apos;ll tailor examples and materials to your region
                            </p>
                        </div>

                        {/* Grade Band */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📚 Grade Band
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {GRADE_BANDS.map((grade) => (
                                    <button
                                        key={grade}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gradeBand: grade })}
                                        className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.gradeBand === grade
                                            ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                                            }`}
                                    >
                                        Grades {grade}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ⏱️ Lesson Duration
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {DURATIONS.map((duration) => (
                                    <button
                                        key={duration}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, durationMinutes: duration })}
                                        className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.durationMinutes === duration
                                            ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                                            }`}
                                    >
                                        {duration} minutes
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Topic Prompt */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🧬 Topic Prompt
                            </label>
                            <textarea
                                value={formData.topicPrompt}
                                onChange={(e) => setFormData({ ...formData, topicPrompt: e.target.value })}
                                placeholder="Example: Photosynthesis — chemical reactions in plants&#10;&#10;Describe your STEM topic. Be specific about concepts, examples, or approaches you want to include."
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors resize-none"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                The more specific you are, the better the lesson plan
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                <span className="font-medium">Error:</span> {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${loading
                                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xl transform active:scale-95'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Synthesizing Lesson Plan...
                                </span>
                            ) : (
                                <span>📝 Generate Lesson Plan</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
