"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Footprints, Moon, Dumbbell } from "lucide-react";
import Link from "next/link";
import TimelineItem from "@/components/TimelineItem";

export default function HealthPage() {
    const [healthData, setHealthData] = useState({
        steps: 0,
        sleepHours: 0,
        weight: 0,
        waterIntake: 0
    });
    const [weightInput, setWeightInput] = useState('');
    const [fitnessLogs, setFitnessLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit states
    const [editingSteps, setEditingSteps] = useState(false);
    const [stepsInput, setStepsInput] = useState('');

    const [editingSleep, setEditingSleep] = useState(false);
    const [sleepInput, setSleepInput] = useState('');

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Health Data
            const healthRes = await fetch('/api/health/today', { headers });
            const healthJson = await healthRes.json();

            if (healthJson.success && healthJson.data) {
                setHealthData(healthJson.data);
                if (healthJson.data.weight) setWeightInput(healthJson.data.weight.toString());
                if (healthJson.data.steps) setStepsInput(healthJson.data.steps.toString());
                if (healthJson.data.sleepHours) setSleepInput(healthJson.data.sleepHours.toString());
            }

            // Fetch Activity Logs (filter for Fitness)
            const logsRes = await fetch('/api/logs/today', { headers });
            const logsJson = await logsRes.json();

            if (logsJson.success) {
                const fitness = logsJson.data.filter((log: any) => log.category === 'Fitness');
                setFitnessLogs(fitness);
            }

        } catch (error) {
            console.error("Failed to fetch health data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateHealth = async (field: string, value: any) => {
        try {
            const token = localStorage.getItem('token');
            const body: any = {};
            body[field] = value;

            const res = await fetch('/api/health', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setEditingSteps(false);
                setEditingSleep(false);
                fetchData();
            }
        } catch (error) {
            console.error(`Failed to update ${field}`, error);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-24 pt-12">
            {/* Header */}
            <div className="mb-6 flex items-center px-6">
                <Link href="/home" className="mr-4 text-gray-900 hover:text-gray-600">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">Health</h1>
            </div>

            <div className="space-y-6 px-4">
                {/* Top Cards - Click to Edit */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Steps Card */}
                    <div
                        onClick={() => {
                            if (!editingSteps) {
                                setEditingSteps(true);
                                setStepsInput(healthData.steps ? healthData.steps.toString() : '');
                            }
                        }}
                        className="rounded-3xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 cursor-pointer hover:border-primary/30 transition-colors"
                    >
                        <div className="mb-4 text-primary"><Footprints size={28} /></div>

                        {editingSteps ? (
                            <div className="flex flex-col gap-2">
                                <input
                                    autoFocus
                                    type="number"
                                    className="w-full border-b border-primary text-xl font-bold focus:outline-none"
                                    value={stepsInput}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setStepsInput(e.target.value)}
                                    onBlur={() => {
                                        if (stepsInput) updateHealth('steps', parseInt(stepsInput));
                                        else setEditingSteps(false);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') updateHealth('steps', parseInt(stepsInput));
                                    }}
                                />
                                <span className="text-xs text-primary font-medium">Press Enter</span>
                            </div>
                        ) : (
                            <>
                                <div className="text-3xl font-bold text-gray-900">
                                    {healthData.steps > 0 ? healthData.steps.toLocaleString() : '--'}
                                    <span className="text-sm font-normal text-gray-500 ml-1">steps</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Tap to edit</div>
                            </>
                        )}
                    </div>

                    {/* Sleep Card */}
                    <div
                        onClick={() => {
                            if (!editingSleep) {
                                setEditingSleep(true);
                                setSleepInput(healthData.sleepHours ? healthData.sleepHours.toString() : '');
                            }
                        }}
                        className="rounded-3xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 cursor-pointer hover:border-primary/30 transition-colors"
                    >
                        <div className="mb-4 text-primary"><Moon size={28} /></div>

                        {editingSleep ? (
                            <div className="flex flex-col gap-2">
                                <input
                                    autoFocus
                                    type="number"
                                    step="0.1"
                                    className="w-full border-b border-primary text-xl font-bold focus:outline-none"
                                    value={sleepInput}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setSleepInput(e.target.value)}
                                    onBlur={() => {
                                        if (sleepInput) updateHealth('sleepHours', parseFloat(sleepInput));
                                        else setEditingSleep(false);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') updateHealth('sleepHours', parseFloat(sleepInput));
                                    }}
                                />
                                <span className="text-xs text-primary font-medium">Press Enter</span>
                            </div>
                        ) : (
                            <>
                                <div className="text-3xl font-bold text-gray-900">
                                    {healthData.sleepHours > 0 ? healthData.sleepHours : '--'}
                                    <span className="text-sm font-normal text-gray-500 ml-1">h</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Tap to edit</div>
                            </>
                        )}
                    </div>
                </div>

                {/* Weight Update */}
                <div className="space-y-3 px-1">
                    <h2 className="ml-1 text-sm font-bold text-gray-900">Current Weight</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <input
                                type="number"
                                value={weightInput}
                                onChange={(e) => setWeightInput(e.target.value)}
                                placeholder="--"
                                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-lg font-bold text-gray-900 focus:border-primary focus:outline-none"
                            />
                            <span className="absolute right-4 top-4 text-sm font-medium text-gray-500">kg</span>
                        </div>
                        <button
                            onClick={() => updateHealth('weight', parseFloat(weightInput))}
                            className="rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-white shadow-sm hover:bg-primary-hover active:scale-95 transition-all"
                        >
                            Update
                        </button>
                    </div>
                </div>

                {/* Activity Log */}
                <div className="rounded-3xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100">
                    <h2 className="mb-6 text-sm font-bold text-gray-900">Fitness Logs</h2>

                    {fitnessLogs.length > 0 ? (
                        <div className="space-y-4">
                            {fitnessLogs.map((log: any, i: number) => (
                                <TimelineItem
                                    key={log._id}
                                    time={log.time}
                                    title={log.title}
                                    icon={Dumbbell}
                                    iconColor="text-blue-400"
                                    isLast={i === fitnessLogs.length - 1}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No fitness activities logged today.</p>
                    )}

                    <div className="mt-6 border-t border-gray-100 pt-4">
                        <p className="text-xs text-gray-400 text-center">Add activities via Home Page (+)</p>
                    </div>
                </div>

                {/* Weight Trend (Simulated Chart) */}
                <div className="rounded-3xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100">
                    <h2 className="mb-4 text-sm font-bold text-gray-900">Weight Trend</h2>
                    <div className="relative h-40 w-full pt-4">
                        <div className="absolute inset-0 flex items-end justify-between px-2 pb-6">
                            {/* Grid lines */}
                            <div className="absolute inset-x-0 bottom-6 h-px bg-gray-100"></div>
                            <div className="absolute inset-x-0 bottom-24 h-px bg-gray-100"></div>
                            <div className="absolute inset-x-0 bottom-40 h-px bg-gray-100"></div>

                            {/* Simulated SVG Line Chart */}
                            <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
                                <path d="M10 40 L 60 80 L 110 120 L 160 130 L 210 110 L 260 120 L 310 140" fill="none" stroke="#34D399" strokeWidth="2.5" />
                                <circle cx="10" cy="40" r="4" fill="#34D399" stroke="white" strokeWidth="2" />
                                <circle cx="60" cy="80" r="4" fill="#34D399" stroke="white" strokeWidth="2" />
                                <circle cx="110" cy="120" r="4" fill="#34D399" stroke="white" strokeWidth="2" />
                                <circle cx="160" cy="130" r="4" fill="#34D399" stroke="white" strokeWidth="2" />
                                <circle cx="210" cy="110" r="4" fill="#34D399" stroke="white" strokeWidth="2" />
                                <circle cx="260" cy="120" r="4" fill="#34D399" stroke="white" strokeWidth="2" />
                                <circle cx="310" cy="140" r="4" fill="#34D399" stroke="white" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex justify-between px-1 text-[10px] font-medium text-gray-400">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                {/* Activity Minutes (Simulated Chart) */}
                <div className="rounded-3xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100">
                    <h2 className="mb-2 text-sm font-bold text-gray-900">Activity Minutes</h2>
                    <p className="mb-6 text-xs text-gray-500">100</p>
                    <div className="flex h-32 w-full items-end justify-between gap-3 pb-2 px-2">
                        {[30, 45, 20, 50, 60, 80, 0].map((h, i) => (
                            <div key={i} className="group relative w-full bg-transparent">
                                <div className="absolute bottom-0 w-full rounded-md bg-blue-400/90" style={{ height: `${h}%` }}></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between px-1 text-[10px] font-medium text-gray-400">
                        <span>Tue</span><span>Wed</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
