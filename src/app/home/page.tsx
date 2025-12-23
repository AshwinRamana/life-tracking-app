"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Timer, MoreVertical, Briefcase, Coffee, Dumbbell, Video, Moon, LogOut, Calendar, CheckCircle, Target, Bell, Loader2 } from "lucide-react";
import QuickLogModal from "@/components/QuickLogModal";

export default function HomePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Friend');
    const [mood, setMood] = useState('Neutral 😐');
    const [focus, setFocus] = useState('Momentum');
    const [goals, setGoals] = useState([]);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', dueDate: '' });
    const [completingGoalId, setCompletingGoalId] = useState<string | null>(null);
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        router.push('/');
    };

    useEffect(() => {
        // Load user name
        const storedName = localStorage.getItem('userName');
        if (storedName) setUserName(storedName);

        fetchLogs();
        fetchAiState();
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/goals', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setGoals(data.data);

                // Reminder Logic
                const overdue = data.data.filter((g: any) => new Date(g.dueDate) < new Date());
                if (overdue.length > 0) {
                    const firstTime = !sessionStorage.getItem('goalNotified');
                    if (firstTime) {
                        alert(`🎯 You have ${overdue.length} goals overdue or due today! Stay focused!`);
                        sessionStorage.setItem('goalNotified', 'true');
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddGoal = async () => {
        if (!newGoal.title || !newGoal.dueDate) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newGoal)
            });
            if (res.ok) {
                setNewGoal({ title: '', dueDate: '' });
                setIsGoalModalOpen(false);
                fetchGoals();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleGoal = async (goalId: string) => {
        setCompletingGoalId(goalId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/goals', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ goalId, completed: true })
            });
            if (res.ok) {
                // Optimistic UI update
                setGoals(prev => prev.filter((g: any) => g._id !== goalId));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setCompletingGoalId(null);
        }
    };

    const fetchAiState = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('/api/ai/daily-summary', {
                method: 'POST', // We use POST to trigger/refresh the analysis
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                if (data.data.suggestedMood) setMood(data.data.suggestedMood);
                if (data.data.suggestedFocus) setFocus(data.data.suggestedFocus);
            }
        } catch (error) {
            console.error("Failed to fetch AI state", error);
        }
    };

    // Style helper
    const getMoodStyle = (m: string) => {
        const text = m.toLowerCase();
        if (text.includes('great') || text.includes('happy') || text.includes('excited'))
            return { bg: 'bg-amber-400/10', border: 'border-amber-400/20', text: 'text-amber-600', icon: 'bg-amber-400/20' };
        if (text.includes('calm') || text.includes('chill') || text.includes('relaxed'))
            return { bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', text: 'text-emerald-600', icon: 'bg-emerald-400/20' };
        if (text.includes('focused') || text.includes('productive') || text.includes('work'))
            return { bg: 'bg-purple-400/10', border: 'border-purple-400/20', text: 'text-purple-600', icon: 'bg-purple-400/20' };
        if (text.includes('tired') || text.includes('sad') || text.includes('stressed'))
            return { bg: 'bg-blue-400/10', border: 'border-blue-400/20', text: 'text-blue-600', icon: 'bg-blue-400/20' };
        return { bg: 'bg-gray-400/10', border: 'border-gray-400/20', text: 'text-gray-600', icon: 'bg-gray-400/20' };
    };

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return; // Should redirect to login ideally

            const res = await fetch('/api/logs/today', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setLogs(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-24 pt-10 px-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                        <Timer size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Welcome back,</p>
                        <p className="text-sm font-bold text-gray-900">{userName}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                </button>
            </div>

            <h1 className="mb-6 text-2xl font-bold text-gray-900">Today's Summary</h1>

            {/* Mood/Focus Cards */}
            <div className="mb-8 grid grid-cols-2 gap-4">
                <div className={`flex items-center gap-4 rounded-2xl border ${getMoodStyle(mood).border} ${getMoodStyle(mood).bg} backdrop-blur-md p-4 shadow-sm transition-all`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${getMoodStyle(mood).icon} ${getMoodStyle(mood).text}`}>
                        <span className="text-xl">{mood.split(' ').pop()}</span>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs opacity-60">Mood</p>
                        <p className={`text-lg font-bold truncate ${getMoodStyle(mood).text}`}>{mood.split(' ')[0]}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-purple-400/20 bg-purple-400/10 backdrop-blur-md p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-400/20 text-purple-600">
                        <span className="text-xl">⚡</span>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs opacity-60 text-purple-600/80">Focus</p>
                        <p className="text-lg font-bold text-purple-600 truncate">{focus}</p>
                    </div>
                </div>
            </div>

            {/* Goals Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">My Goals</h2>
                    <button
                        onClick={() => setIsGoalModalOpen(true)}
                        className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-full"
                    >
                        <Target size={14} /> New Goal
                    </button>
                </div>

                {goals.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                        <p className="text-xs text-gray-400 mb-1">Stay on track with your goals.</p>
                        <p className="text-sm font-medium text-gray-500">No active goals found.</p>
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {goals.map((goal: any) => {
                            const isOverdue = new Date(goal.dueDate) < new Date();
                            return (
                                <div key={goal._id} className="min-w-[200px] bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-colors group">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <p className="font-bold text-gray-900 text-sm line-clamp-2">{goal.title}</p>
                                        <button
                                            onClick={() => toggleGoal(goal._id)}
                                            disabled={completingGoalId === goal._id}
                                            className="text-gray-300 hover:text-green-500 transition-colors disabled:opacity-50"
                                        >
                                            {completingGoalId === goal._id ? <Loader2 size={20} className="animate-spin text-primary" /> : <CheckCircle size={20} />}
                                        </button>
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                                        <Calendar size={12} />
                                        {new Date(goal.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        {isOverdue && " (Overdue)"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Your Activities */}
            <div className="mb-24">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Your Activities</h2>

                {loading ? (
                    <div className="text-center text-gray-400 py-10">Loading your day...</div>
                ) : logs.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                        <p>No activities yet today.</p>
                        <p className="text-sm">Tap + to start tracking!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log: any) => (
                            <ActivityCard
                                key={log._id}
                                time={log.time}
                                title={log.title}
                                category={log.category}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-xl hover:bg-primary-hover transition-transform active:scale-95"
                >
                    <Plus size={32} />
                </button>
            </div>

            <QuickLogModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    fetchLogs(); // Refresh list after closing modal
                }}
            />

            {/* Goal Creation Modal */}
            {isGoalModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-gray-900/20 animate-in fade-in">
                    <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
                        <h3 className="mb-4 text-xl font-bold text-gray-900">Set a New Goal</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-gray-400">WHAT IS YOUR GOAL?</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Run 5km"
                                    className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-gray-100"
                                    value={newGoal.title}
                                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-gray-400">BY WHEN?</label>
                                <input
                                    type="date"
                                    className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-gray-100"
                                    value={newGoal.dueDate}
                                    onChange={e => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setIsGoalModalOpen(false)}
                                className="flex-1 rounded-2xl border border-gray-100 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddGoal}
                                disabled={!newGoal.title || !newGoal.dueDate}
                                className="flex-1 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 transition-all"
                            >
                                Set Goal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper to get icon based on category
function getCategoryIcon(category: string) {
    switch (category) {
        case 'Work': return { icon: Briefcase, bg: 'bg-blue-50 text-blue-500' };
        case 'Food': return { icon: Coffee, bg: 'bg-orange-50 text-orange-500' };
        case 'Fitness': return { icon: Dumbbell, bg: 'bg-green-50 text-green-500' };
        case 'Social': return { icon: Video, bg: 'bg-pink-50 text-pink-500' };
        case 'Rest': return { icon: Moon, bg: 'bg-indigo-50 text-indigo-500' };
        default: return { icon: Timer, bg: 'bg-gray-50 text-gray-500' };
    }
}

function ActivityCard({ time, title, category }: { time: string, title: string, category: string }) {
    const { icon: Icon, bg } = getCategoryIcon(category);

    return (
        <div>
            <p className="mb-2 text-xs font-semibold text-gray-500">{time}</p>
            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg}`}>
                    <Icon size={18} />
                </div>
                <p className="text-sm font-medium text-gray-900 leading-relaxed">{title}</p>
            </div>
        </div>
    )
}
