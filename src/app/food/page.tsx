"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Circle, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

interface FoodItem {
    name: string;
    calories: number;
}

interface FoodLogData {
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
    snacks: FoodItem[];
    totalCalories: number;
}

const emptyData: FoodLogData = { breakfast: [], lunch: [], dinner: [], snacks: [], totalCalories: 0 };

export default function FoodPage() {
    const [foodData, setFoodData] = useState<FoodLogData>(emptyData);
    const [loading, setLoading] = useState(true);

    const fetchFood = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('/api/food/today', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setFoodData(data.data);
            } else {
                setFoodData(emptyData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFood();
    }, []);

    const handleAdd = async (mealType: string, name: string, calories: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/food', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ mealType: mealType.toLowerCase(), name, calories })
            });
            if (res.ok) {
                fetchFood(); // Refresh data
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-24 pt-12">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between px-6">
                <div className="flex items-center">
                    <Link href="/home" className="mr-4 text-gray-900 hover:text-gray-600">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Food Log</h1>
                </div>
                <div className="rounded-full bg-orange-50 px-4 py-1.5 text-sm font-bold text-orange-600">
                    {loading ? '...' : `${foodData.totalCalories} kcal`}
                </div>
            </div>

            <div className="space-y-6 px-4">
                <MealSection title="Breakfast" items={foodData.breakfast} onAdd={handleAdd} />
                <MealSection title="Lunch" items={foodData.lunch} onAdd={handleAdd} />
                <MealSection title="Dinner" items={foodData.dinner} onAdd={handleAdd} />
                <MealSection title="Snacks" items={foodData.snacks} onAdd={handleAdd} />
            </div>
        </div>
    );
}

function MealSection({ title, items, onAdd }: { title: string, items: FoodItem[], onAdd: (type: string, name: string, cal: number) => void }) {
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [isEstimating, setIsEstimating] = useState(false);

    const handleAiEstimate = async () => {
        if (!name) return;
        setIsEstimating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/food/estimate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ foodName: name })
            });
            const data = await res.json();
            if (data.success) {
                setCalories(data.calories.toString());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsEstimating(false);
        }
    };

    const submit = () => {
        if (!name || !calories) return;
        onAdd(title, name, parseInt(calories));
        setName('');
        setCalories('');
    };

    return (
        <div className="rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
            <h2 className="mb-4 font-bold text-gray-900">{title}</h2>

            {items.length > 0 ? (
                <div className="mb-6 space-y-5">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                                <Circle size={14} className="text-gray-400" />
                                <span className="font-medium text-gray-900">{item.name}</span>
                            </div>
                            <span className="font-medium text-gray-500">{item.calories} kcal</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mb-4 text-sm italic text-gray-400">No items logged yet.</p>
            )}

            <div className="flex items-center gap-3">
                <div className="flex-1 rounded-xl bg-gray-200/60 px-4 py-3">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={`Add food...`}
                        className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none mb-2"
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                            placeholder="Calories"
                            className="w-24 bg-transparent text-xs text-gray-600 placeholder-gray-400 focus:outline-none"
                        />
                        {name && !calories && (
                            <button
                                onClick={handleAiEstimate}
                                disabled={isEstimating}
                                className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary-hover transition-all"
                            >
                                {isEstimating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                {isEstimating ? 'Estimating...' : 'AI Magic'}
                            </button>
                        )}
                    </div>
                </div>
                <button
                    onClick={submit}
                    disabled={!name || !calories}
                    className="flex items-center gap-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-hover disabled:opacity-50"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    )
}
