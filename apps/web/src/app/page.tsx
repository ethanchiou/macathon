'use client';

import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();

  return (
    <div className="min-h-[calc(100vh-72px)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Create Engaging Biology Lessons
              <span className="block text-emerald-200 mt-2">
                in Minutes, Not Hours
              </span>
            </h1>
            <p className="text-xl text-emerald-100 mb-8">
              AI-powered lesson plan generator designed for biology teachers in
              low-resource regions. Get structured, classroom-ready content
              tailored to your students.
            </p>

            {loading ? (
              <div className="w-48 h-14 bg-white/20 rounded-lg mx-auto animate-pulse" />
            ) : user ? (
              <Link
                href="/create"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-xl"
              >
                <span className="text-2xl">🧪</span>
                Create Lesson Plan
              </Link>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-xl"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                Get Started with Google
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Designed for Real Classrooms
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              emoji="🌍"
              title="Localized Content"
              description="Examples and activities tailored to your region, using locally available materials"
            />
            <FeatureCard
              emoji="📊"
              title="Structured Format"
              description="Clear learning goals, activities, assessments, and differentiation strategies"
            />
            <FeatureCard
              emoji="⚡"
              title="Ready in Minutes"
              description="Generate complete lesson plans instantly, then customize as needed"
            />
            <FeatureCard
              emoji="🔬"
              title="Biology-Focused"
              description="Scientifically accurate content with common misconceptions addressed"
            />
            <FeatureCard
              emoji="✏️"
              title="Fully Editable"
              description="Customize every section to match your teaching style and student needs"
            />
            <FeatureCard
              emoji="📱"
              title="Access Anywhere"
              description="Save your lessons to the cloud and access them from any device"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How It Works
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
            <Step number={1} title="Enter Details" description="Select your region, grade level, and describe your topic" />
            <Arrow />
            <Step number={2} title="Generate" description="Our AI creates a structured lesson plan in seconds" />
            <Arrow />
            <Step number={3} title="Customize" description="Edit any section to perfectly fit your classroom" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">🌱 BioLesson - Making quality education accessible</p>
          <p className="text-sm opacity-75">Built for teachers, by people who care about education</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
      <span className="text-4xl mb-4 block">{emoji}</span>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm max-w-xs">{description}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden md:block text-emerald-400">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
