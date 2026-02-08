'use client';

/**
 * Navigation Header
 */
import Link from 'next/link';
import { useAuth } from './AuthProvider';

export function Header() {
    const { user, loading, signInWithGoogle, signOut } = useAuth();

    return (
        <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">🌱</span>
                        <span className="text-xl font-bold">BioLesson</span>
                    </Link>

                    <nav className="flex items-center gap-6">
                        {user && (
                            <>
                                <Link
                                    href="/create"
                                    className="hover:text-emerald-200 transition-colors font-medium"
                                >
                                    Create Lesson
                                </Link>
                                <Link
                                    href="/create-video"
                                    className="hover:text-emerald-200 transition-colors font-medium"
                                >
                                    Create Video
                                </Link>
                                <Link
                                    href="/library"
                                    className="hover:text-emerald-200 transition-colors font-medium"
                                >
                                    My Library
                                </Link>
                            </>
                        )}

                        {loading ? (
                            <div className="w-24 h-10 bg-white/20 rounded animate-pulse" />
                        ) : user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm opacity-90">
                                    {user.displayName || user.email}
                                </span>
                                <button
                                    onClick={signOut}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={signInWithGoogle}
                                className="px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Sign in with Google
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
