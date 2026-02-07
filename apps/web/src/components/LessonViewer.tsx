'use client';

/**
 * Lesson Plan Viewer Component
 * Displays lesson plan in structured, readable format
 * Supports edit mode with section-by-section editing
 */
import { useState } from 'react';
import type { LessonPlan } from '@/types';

interface LessonViewerProps {
    lessonPlan: LessonPlan;
    onSave?: (lessonPlan: LessonPlan) => Promise<void>;
    saving?: boolean;
}

export function LessonViewer({ lessonPlan, onSave, saving }: LessonViewerProps) {
    const [editMode, setEditMode] = useState(false);
    const [editedPlan, setEditedPlan] = useState<LessonPlan>(lessonPlan);

    const handleSave = async () => {
        if (onSave) {
            await onSave(editedPlan);
            setEditMode(false);
        }
    };

    const updateField = <K extends keyof LessonPlan>(
        field: K,
        value: LessonPlan[K]
    ) => {
        setEditedPlan((prev) => ({ ...prev, [field]: value }));
    };

    const updateArrayItem = (
        field: keyof LessonPlan,
        index: number,
        value: string
    ) => {
        const arr = [...(editedPlan[field] as string[])];
        arr[index] = value;
        updateField(field, arr as LessonPlan[typeof field]);
    };

    const plan = editMode ? editedPlan : lessonPlan;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8 rounded-t-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                            Grades {plan.gradeBand}
                        </span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                            {plan.durationMinutes} min
                        </span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                            {plan.region}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {onSave && (
                            <>
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${editMode
                                            ? 'bg-yellow-500 hover:bg-yellow-600'
                                            : 'bg-white/20 hover:bg-white/30'
                                        }`}
                                >
                                    {editMode ? '✏️ Editing' : '✏️ Edit'}
                                </button>
                                {editMode && (
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-4 py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : '💾 Save'}
                                    </button>
                                )}
                            </>
                        )}
                        <button
                            disabled
                            className="px-4 py-2 bg-white/10 rounded-lg font-medium cursor-not-allowed opacity-50"
                            title="Coming in Phase 3"
                        >
                            📄 Export PDF
                        </button>
                    </div>
                </div>
                {editMode ? (
                    <input
                        type="text"
                        value={editedPlan.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="text-3xl font-bold bg-white/10 rounded px-2 py-1 w-full"
                    />
                ) : (
                    <h1 className="text-3xl font-bold">{plan.title}</h1>
                )}
            </div>

            {/* Content Sections */}
            <div className="bg-white shadow-xl rounded-b-2xl">
                {/* Learning Goals */}
                <Section title="🎯 Learning Goals" color="emerald">
                    <ul className="list-disc list-inside space-y-2">
                        {plan.learningGoals.map((goal, i) => (
                            <li key={i}>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={editedPlan.learningGoals[i]}
                                        onChange={(e) =>
                                            updateArrayItem('learningGoals', i, e.target.value)
                                        }
                                        className="ml-2 border-b border-gray-300 focus:border-emerald-500 outline-none w-5/6"
                                    />
                                ) : (
                                    goal
                                )}
                            </li>
                        ))}
                    </ul>
                </Section>

                {/* Prior Knowledge */}
                <Section title="📚 Prior Knowledge Recap" color="blue">
                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Review Points:</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {plan.priorKnowledgeRecap.bullets.map((bullet, i) => (
                                <li key={i} className="text-gray-600">
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">
                            Quick Check Questions:
                        </h4>
                        <ul className="list-decimal list-inside space-y-1">
                            {plan.priorKnowledgeRecap.quickCheckQuestions.map((q, i) => (
                                <li key={i} className="text-gray-600">
                                    {q}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Section>

                {/* Core Explanation */}
                <Section title="📖 Core Explanation" color="purple">
                    <div className="space-y-4">
                        {plan.coreExplanation.map((para, i) => (
                            <p key={i} className="text-gray-700 leading-relaxed">
                                {editMode ? (
                                    <textarea
                                        value={editedPlan.coreExplanation[i]}
                                        onChange={(e) =>
                                            updateArrayItem('coreExplanation', i, e.target.value)
                                        }
                                        className="w-full border rounded p-2 focus:border-purple-500 outline-none"
                                        rows={3}
                                    />
                                ) : (
                                    para
                                )}
                            </p>
                        ))}
                    </div>
                </Section>

                {/* Common Misconceptions */}
                <Section title="⚠️ Common Misconceptions" color="orange">
                    <div className="space-y-6">
                        {plan.commonMisconceptions.map((item, i) => (
                            <div
                                key={i}
                                className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400"
                            >
                                <div className="mb-2">
                                    <span className="font-semibold text-orange-700">
                                        ❌ Misconception:
                                    </span>
                                    <p className="text-gray-600 ml-4">{item.misconception}</p>
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold text-green-700">
                                        ✓ Correction:
                                    </span>
                                    <p className="text-gray-600 ml-4">{item.correction}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-blue-700">
                                        ❓ Check Question:
                                    </span>
                                    <p className="text-gray-600 ml-4 italic">
                                        &quot;{item.checkQuestion}&quot;
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Activity */}
                <Section title="🎨 Hands-On Activity" color="pink">
                    <div className="bg-pink-50 p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-pink-700">
                                {plan.activity.title}
                            </h3>
                            <span className="px-3 py-1 bg-pink-200 text-pink-800 rounded-full text-sm">
                                ⏱️ {plan.activity.timeMinutes} minutes
                            </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">
                                    📦 Materials:
                                </h4>
                                <ul className="list-disc list-inside text-gray-600 space-y-1">
                                    {plan.activity.materials.map((m, i) => (
                                        <li key={i}>{m}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">📋 Steps:</h4>
                                <ol className="list-decimal list-inside text-gray-600 space-y-1">
                                    {plan.activity.steps.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>

                        <div className="mt-4 grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">
                                    👩‍🏫 Teacher Prompts:
                                </h4>
                                <ul className="text-gray-600 space-y-1">
                                    {plan.activity.teacherPrompts.map((p, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span>💬</span>
                                            <span>&quot;{p}&quot;</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">
                                    👨‍🎓 Expected Responses:
                                </h4>
                                <ul className="text-gray-600 space-y-1">
                                    {plan.activity.expectedStudentResponses.map((r, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span>💡</span>
                                            <span>{r}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Exit Ticket */}
                <Section title="🎫 Exit Ticket" color="yellow">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <ol className="list-decimal list-inside space-y-2">
                            {plan.exitTicket.map((q, i) => (
                                <li key={i} className="text-gray-700">
                                    {q}
                                </li>
                            ))}
                        </ol>
                    </div>
                </Section>

                {/* Differentiation */}
                <Section title="🌈 Differentiation Strategies" color="indigo">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-red-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-700 mb-2">
                                🐢 Struggling Learners
                            </h4>
                            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                {plan.differentiation.strugglingLearners.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-700 mb-2">
                                🚀 Advanced Learners
                            </h4>
                            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                {plan.differentiation.advancedLearners.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-700 mb-2">
                                🌍 Language Learners
                            </h4>
                            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                {plan.differentiation.languageLearners.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Section>

                {/* Local Context */}
                <Section title="🌍 Local Context Examples" color="teal" last>
                    <div className="grid md:grid-cols-3 gap-4">
                        {plan.localContextExamples.map((example, i) => (
                            <div key={i} className="bg-teal-50 p-4 rounded-lg text-gray-700">
                                <span className="text-2xl mb-2 block">
                                    {['🏞️', '🌾', '🦜'][i % 3]}
                                </span>
                                {example}
                            </div>
                        ))}
                    </div>
                </Section>
            </div>
        </div>
    );
}

function Section({
    title,
    color,
    children,
    last = false,
}: {
    title: string;
    color: string;
    children: React.ReactNode;
    last?: boolean;
}) {
    const colorClasses: Record<string, string> = {
        emerald: 'border-emerald-200 bg-emerald-50',
        blue: 'border-blue-200 bg-blue-50',
        purple: 'border-purple-200 bg-purple-50',
        orange: 'border-orange-200 bg-orange-50',
        pink: 'border-pink-200 bg-pink-50',
        yellow: 'border-yellow-200 bg-yellow-50',
        indigo: 'border-indigo-200 bg-indigo-50',
        teal: 'border-teal-200 bg-teal-50',
    };

    return (
        <div className={`p-6 ${!last ? 'border-b border-gray-100' : ''}`}>
            <h2
                className={`text-xl font-bold mb-4 px-3 py-2 rounded-lg ${colorClasses[color]}`}
            >
                {title}
            </h2>
            {children}
        </div>
    );
}
