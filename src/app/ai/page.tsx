"use client";

import { ChevronLeft, Send, Sparkles, User, Bot, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Markdown from 'react-markdown';

export default function AIPage() {
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([
        { role: 'ai', content: "Hello! I'm your Momentum AI. I can help you analyze your day, give health tips, or just chat. How can I help?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const processActions = async (actions: any[]) => {
        const token = localStorage.getItem('token');
        for (const action of actions) {
            try {
                let endpoint = '';
                let body: any = {};

                if (action.type === 'food') {
                    endpoint = '/api/food';
                    body = {
                        mealType: action.mealType || 'snacks',
                        name: action.name,
                        calories: action.calories ? parseInt(action.calories.toString().replace(/,/g, '')) : 0
                    };
                } else if (action.type === 'activity') {
                    endpoint = '/api/logs';
                    body = {
                        title: action.title,
                        category: action.category || 'Rest',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                } else if (action.type === 'journal') {
                    endpoint = '/api/journal';
                    body = { content: action.content };
                } else if (action.type === 'goal') {
                    endpoint = '/api/goals';
                    body = { title: action.title, dueDate: action.dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0] };
                } else if (action.type === 'health') {
                    endpoint = '/api/health';
                    const stepsVal = action.steps !== undefined ? parseInt(action.steps.toString().replace(/,/g, '')) : undefined;
                    const hVal = action.sleepHours !== undefined ? parseFloat(action.sleepHours.toString()) : undefined;
                    const wVal = action.weight !== undefined ? parseFloat(action.weight.toString()) : undefined;

                    body = {
                        steps: isNaN(stepsVal as number) ? undefined : stepsVal,
                        sleepHours: isNaN(hVal as number) ? undefined : hVal,
                        weight: isNaN(wVal as number) ? undefined : wVal,
                        waterIntake: action.waterIntake ? parseInt(action.waterIntake.toString()) : undefined
                    };
                }

                if (endpoint) {
                    console.log(`AI Action triggered: ${action.type}`, body);
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify(body)
                    });

                    let data;
                    try {
                        const contentType = res.headers.get("content-type");
                        if (contentType && contentType.includes("application/json")) {
                            data = await res.json();
                        }
                    } catch (e) {
                        console.error("JSON Parse Error", e);
                    }

                    if (res.ok) {
                        let detail = '';
                        if (action.type === 'health') {
                            if (body.steps !== undefined) detail = `${body.steps} steps`;
                            else if (body.sleepHours !== undefined) detail = `${body.sleepHours}h sleep`;
                            else if (body.weight !== undefined) detail = `${body.weight}kg weight`;
                            else detail = 'Health details';
                        } else {
                            detail = action.name || action.title || 'Entry';
                        }

                        const label = action.type === 'goal' ? 'Set new goal' :
                            action.type === 'health' ? 'Logged health data' :
                                `Logged your ${action.type}`;

                        setMessages(prev => [...prev, { role: 'ai', content: `✅ ${label}: "${detail}"` }]);

                        if (action.type === 'health') {
                            await fetch('/api/logs', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({
                                    title: `Health Update: ${detail}`,
                                    category: 'Fitness',
                                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                })
                            }).catch(() => { });
                        }
                    } else {
                        const errMsg = data?.error || `Server error (${res.status})`;
                        setMessages(prev => [...prev, { role: 'ai', content: `⚠️ Failed to log ${action.type}: ${errMsg}` }]);
                    }
                }
            } catch (err: any) {
                console.error("Action process error:", err);
                setMessages(prev => [...prev, { role: 'ai', content: `❌ Technical error logging ${action.type}.` }]);
            }
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMsg.content })
            });

            const data = await res.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
                if (data.actions && data.actions.length > 0) {
                    await processActions(data.actions);
                }
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'ai', content: "Network error. Please check your connection." }]);
        } finally {
            setLoading(false);
        }
    };

    const generateSummary = async () => {
        if (loading) return;

        setMessages(prev => [...prev, { role: 'user', content: "Generate my daily summary." }]);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/ai/daily-summary', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (data.success && data.data) {
                const summaryMsg = `**Daily Summary** 📊\n\n${data.data.summaryContent}\n\n**Mood Score:** ${data.data.moodScore}/10\n**Action Item:** ${data.data.actionItems?.[0] || 'Keep going!'}`;
                setMessages(prev => [...prev, { role: 'ai', content: summaryMsg }]);
            } else {
                const errorMsg = data.isMock ? "Mock summary generated (AI offline)." : "Failed to generate summary.";
                setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
            }
        } catch (error) {
            console.error("Summary error:", error);
            setMessages(prev => [...prev, { role: 'ai', content: "Failed to connect to AI service." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-gray-50 h-[100dvh] flex-col pb-4 pt-12">
            {/* Header */}
            <div className="mb-2 flex items-center justify-between px-6 bg-white py-4 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Link href="/home" className="text-gray-500 hover:text-gray-900">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                            <Sparkles size={12} /> Online
                        </p>
                    </div>
                </div>
                <button
                    onClick={generateSummary}
                    title="Generate Daily Summary"
                    className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {msg.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
                        </div>

                        <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                            }`}>
                            <Markdown>{msg.content}</Markdown>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <Bot size={18} />
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 pt-2">
                <div className="flex items-center gap-2 rounded-full bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="rounded-full bg-emerald-500 p-3 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
