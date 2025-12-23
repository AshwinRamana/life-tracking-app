"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Send, Clock, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';

export default function JournalPage() {
    const [entries, setEntries] = useState<{ _id?: string, content: string, timestamp?: string }[]>([]);
    const [newEntry, setNewEntry] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchJournal();
    }, []);

    // Scroll to bottom when entries change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [entries]);

    const fetchJournal = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('/api/journal', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();

            if (json.success && json.data && json.data.entries) {
                setEntries(json.data.entries);
            }
        } catch (error) {
            console.error("Failed to fetch journal", error);
        } finally {
            setLoading(false);
        }
    };

    const addEntry = async () => {
        if (!newEntry.trim()) return;

        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            // Optimistic update
            const tempEntry = {
                content: newEntry,
                timestamp: new Date().toISOString(),
                _id: 'temp-' + Date.now()
            };
            setEntries([...entries, tempEntry]);
            setNewEntry('');

            const res = await fetch('/api/journal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: tempEntry.content })
            });

            if (res.ok) {
                await fetchJournal(); // Refresh to get real IDs and synced state
            }
        } catch (error) {
            console.error("Failed to save entry", error);
        } finally {
            setSaving(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addEntry();
        }
    };

    const todayDate = format(new Date(), 'EEEE, MMMM d, yyyy');

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 pb-6 pt-12">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between px-6 bg-white py-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center">
                    <Link href="/home" className="mr-4 text-gray-900 hover:text-gray-600">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Journal</h1>
                        <p className="text-xs text-gray-500">{todayDate}</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Timeline Area */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
                {loading ? (
                    <div className="flex justify-center pt-10 text-gray-400 text-sm">Loading thoughts...</div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <Clock size={32} />
                        </div>
                        <p className="text-gray-500 font-medium">No entries yet today.</p>
                        <p className="text-xs text-gray-400 mt-1">Start writing to track your day.</p>
                    </div>
                ) : (
                    entries.map((entry, index) => (
                        <div key={entry._id || index} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex flex-col items-center pt-2">
                                <div className="w-2 h-2 rounded-full bg-primary/40 ring-4 ring-white"></div>
                                {index !== entries.length - 1 && (
                                    <div className="w-0.5 h-full bg-gray-100 my-1"></div>
                                )}
                            </div>
                            <div className="flex-1 pb-4">
                                <span className="text-xs font-semibold text-primary/70 mb-1 block">
                                    {entry.timestamp ? format(new Date(entry.timestamp), 'h:mm a') : 'Just now'}
                                </span>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-gray-800 text-sm leading-relaxed border border-gray-100">
                                    {entry.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 pt-2">
                <div className="relative flex items-end gap-2 bg-white p-2 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
                    <textarea
                        value={newEntry}
                        onChange={(e) => setNewEntry(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Write a new entry..."
                        className="flex-1 max-h-32 min-h-[50px] resize-none bg-transparent border-none px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none"
                        rows={1}
                    />
                    <button
                        onClick={addEntry}
                        disabled={!newEntry.trim() || saving}
                        className="mb-1 mr-1 p-3 rounded-full bg-primary text-white shadow-md hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
