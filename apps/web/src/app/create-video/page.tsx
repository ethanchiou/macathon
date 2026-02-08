'use client';

/**
 * Create Video Lesson Page
 * Form for generating new video lessons
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { generateVideo } from '@/lib/api';
import { REGIONS, GRADE_BANDS, SLIDE_COUNTS, type VideoRequest } from '@/types';

export default function CreateVideoPage() {
    const router = useRouter();
    const { user, loading: authLoading, signInWithGoogle } = useAuth();

    const [formData, setFormData] = useState<VideoRequest>({
        topic: '',
        gradeBand: '6-8',
        region: 'Kenya',
        slideCount: 5,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');
    const [videoResult, setVideoResult] = useState<{ id: string, title: string, url: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.topic.trim()) {
            setError('Please enter a topic');
            return;
        }

        setLoading(true);
        setError(null);
        setStatus('Generating video script...');

        try {
            setStatus('Creating slides and narration (this may take 30-60 seconds)...');
            const response = await generateVideo(formData);

            // Set result for display
            setVideoResult({
                id: response.videoId,
                title: response.title,
                url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/videos/${response.videoId}/stream`
            });

            setStatus('Video created successfully!');
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate video');
            setStatus('');
            setLoading(false);
        }
    };

    // Show loading state
    if (authLoading) {
        return (
            <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // Show sign-in prompt if not authenticated
    if (!user) {
        return (
            <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <span className="text-6xl mb-4 block">🎬</span>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Sign In Required
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Please sign in to create video lessons
                    </p>
                    <button
                        onClick={signInWithGoogle}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
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
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">🎬</span>
                            <h1 className="text-3xl font-bold tracking-tight !text-white">Generate Video Lesson</h1>
                        </div>
                        <p className="text-slate-400">
                            Syncing AI visuals and narration into a professional stream
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Topic */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🧬 Topic
                            </label>
                            <textarea
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                placeholder="Example: Photosynthesis - how plants convert sunlight to energy&#10;&#10;Describe your biology topic. Be specific about what concepts to cover."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                The AI will create a script, generate images, and add narration
                            </p>
                        </div>

                        {/* Region */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🌍 Region / Country
                            </label>
                            <select
                                value={formData.region}
                                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            >
                                {REGIONS.map((region) => (
                                    <option key={region} value={region}>
                                        {region}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Grade Band */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-serif text-lg">
                                📚 Grade Band
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {GRADE_BANDS.map((grade) => (
                                    <button
                                        key={grade}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gradeBand: grade })}
                                        className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.gradeBand === grade
                                            ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                                            }`}
                                    >
                                        Grades {grade}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Slide Count */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🖼️ Number of Slides
                            </label>
                            <div className="grid grid-cols-6 gap-2">
                                {SLIDE_COUNTS.map((count) => (
                                    <button
                                        key={count}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, slideCount: count })}
                                        className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.slideCount === count
                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {count}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Each slide is ~15-20 seconds (total video: {formData.slideCount * 17} sec)
                            </p>
                        </div>

                        {/* Status Message */}
                        {status && !error && (
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 flex items-center gap-3">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {status}
                            </div>
                        )}

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
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Streaming Assets...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    🎬 Create Synapse Stream
                                </span>
                            )}
                        </button>

                        {/* Info Box */}
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm">
                            <p className="font-medium mb-2">How it works:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>AI generates a script tailored to your topic</li>
                                <li>Each slide gets a custom illustration</li>
                                <li>Professional narration is added via text-to-speech</li>
                                <li>Everything is assembled into a video (~30-60 sec)</li>
                            </ol>
                        </div>
                    </form>

                    {/* Video Result Overlay/Section */}
                    {videoResult && (
                        <div className="p-8 border-t border-gray-100 bg-purple-50 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">🎉 Your Video is Ready!</h2>
                                <button
                                    onClick={() => setVideoResult(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
                                <video
                                    src={videoResult.url}
                                    controls
                                    className="w-full h-full"
                                    poster="/video-placeholder.png"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href={videoResult.url}
                                    download={`${videoResult.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors"
                                >
                                    ⬇️ Download Video
                                </a>
                                <button
                                    onClick={() => {
                                        setVideoResult(null);
                                        setFormData({ ...formData, topic: '' });
                                    }}
                                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg"
                                >
                                    ✨ Create Another
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
