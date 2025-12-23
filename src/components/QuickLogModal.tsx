"use client";

import { useState, useEffect } from "react";
import { X, Briefcase, Utensils, Dumbbell, Users, Moon, ChevronUp, ChevronDown } from "lucide-react";

interface QuickLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickLogModal({ isOpen, onClose }: QuickLogModalProps) {
    const [category, setCategory] = useState('Work');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    // Time state
    const [hours, setHours] = useState('12');
    const [minutes, setMinutes] = useState('00');

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            setHours(now.getHours().toString().padStart(2, '0'));
            setMinutes(now.getMinutes().toString().padStart(2, '0'));
            setTitle(''); // Reset title
            setCategory('Work');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!title.trim()) return;
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    category,
                    title,
                    time: `${hours}:${minutes}`
                })
            });

            if (res.ok) {
                onClose(); // Close and trigger refresh
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const adjustTime = (type: 'hour' | 'minute', amount: number) => {
        if (type === 'hour') {
            let h = parseInt(hours) + amount;
            if (h > 23) h = 0;
            if (h < 0) h = 23;
            setHours(h.toString().padStart(2, '0'));
        } else {
            let m = parseInt(minutes) + amount;
            if (m > 59) m = 0;
            if (m < 0) m = 59;
            setMinutes(m.toString().padStart(2, '0'));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 transition-all duration-300 sm:items-center">
            <div className="h-[90vh] w-full rounded-t-3xl bg-white p-6 shadow-2xl sm:h-auto sm:max-w-md sm:rounded-3xl animate-in slide-in-from-bottom duration-300">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Log Activity</h2>
                    <button onClick={onClose} className="rounded-full p-2 text-gray-900 hover:bg-gray-100">
                        <X size={24} />
                    </button>
                </div>

                {/* Time Picker */}
                <div className="mb-8 flex justify-center gap-8">
                    <div className="flex flex-col items-center gap-2">
                        <button onClick={() => adjustTime('hour', 1)}><ChevronUp className="text-primary" /></button>
                        <span className="text-4xl font-bold text-gray-900">{hours}</span>
                        <button onClick={() => adjustTime('hour', -1)}><ChevronDown className="text-primary" /></button>
                    </div>
                    <div className="flex items-center pt-2">
                        <span className="text-4xl font-bold text-gray-900">:</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <button onClick={() => adjustTime('minute', 5)}><ChevronUp className="text-primary" /></button>
                        <span className="text-4xl font-bold text-gray-900">{minutes}</span>
                        <button onClick={() => adjustTime('minute', -5)}><ChevronDown className="text-primary" /></button>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="mb-8 grid grid-cols-2 gap-4">
                    <CategoryItem
                        icon={Briefcase}
                        label="Work"
                        selected={category === 'Work'}
                        onClick={() => setCategory('Work')}
                    />
                    <CategoryItem
                        icon={Utensils}
                        label="Food"
                        selected={category === 'Food'}
                        onClick={() => setCategory('Food')}
                    />
                    <CategoryItem
                        icon={Dumbbell}
                        label="Fitness"
                        selected={category === 'Fitness'}
                        onClick={() => setCategory('Fitness')}
                    />
                    <CategoryItem
                        icon={Users}
                        label="Social"
                        selected={category === 'Social'}
                        onClick={() => setCategory('Social')}
                    />
                    <CategoryItem
                        icon={Moon}
                        label="Rest"
                        selected={category === 'Rest'}
                        onClick={() => setCategory('Rest')}
                    />
                </div>

                {/* Input */}
                <div className="mb-6 space-y-3">
                    <label className="text-sm font-semibold text-gray-500">What did you do?</label>
                    <textarea
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Finished project report, ate pasta for lunch..."
                        className="h-28 w-full rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-900 placeholder-gray-500 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                {/* Button */}
                <button
                    onClick={handleSave}
                    disabled={loading || !title.trim()}
                    className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-white hover:bg-primary-hover shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : 'Save Activity'}
                </button>
            </div>
        </div>
    );
}

function CategoryItem({ icon: Icon, label, selected, onClick }: { icon: any; label: string, selected: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex h-24 flex-col items-center justify-center gap-3 rounded-2xl border shadow-sm transition-all
                ${selected
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-gray-100 bg-white hover:border-primary hover:bg-primary/5'
                }`}
        >
            <Icon size={24} className={selected ? 'text-primary' : 'text-gray-900'} strokeWidth={selected ? 2.5 : 1.5} />
            <span className={`text-sm font-medium ${selected ? 'text-primary' : 'text-gray-900'}`}>{label}</span>
        </button>
    );
}
