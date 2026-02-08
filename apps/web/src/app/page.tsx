'use client';

import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();

  return (
    <div className="min-h-[calc(100vh-72px)]">
      {/* Hero Section */}
      <section className="bg-slate-900 border-b border-slate-800 text-white py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight !text-white">
              Empower Every
              <span className="text-purple-400"> STEM Educator </span>
              Worldwide
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              SynapseStream is an AI-powered platform designed to instantly generate
              high-quality biology lesson plans and narrated video lessons.
              Bridging the gap in global education with cutting-edge technology.
            </p>

            {loading ? (
              <div className="w-48 h-14 bg-white/10 rounded-lg mx-auto animate-pulse" />
            ) : user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-lg"
                >
                  <span className="text-2xl">📝</span>
                  Generate Lesson
                </Link>
                <Link
                  href="/create-video"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg"
                >
                  <span className="text-2xl">🎬</span>
                  Generate Video
                </Link>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-lg"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
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
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4 text-white font-bold text-lg">⚡ SynapseStream</p>
          <p className="text-sm opacity-75 max-w-md mx-auto">
            Making world-class STEM education accessible to every classroom,
            driven by ethical AI and dedicated educators.
          </p>
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
