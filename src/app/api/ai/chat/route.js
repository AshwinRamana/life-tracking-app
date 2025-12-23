import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { getDailyContext } from '@/lib/dataContext';
import { generateAIResponse } from '@/lib/aiProvider';

export async function POST(req) {
    try {
        await dbConnect();
        const userId = await verifyAuth(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { message } = await req.json();
        const contextData = await getDailyContext(userId);

        const prompt = `
SYSTEM: You are a helpful Life Assistant.
YOUR GOAL: Help the user track their day and set goals.
Analyze the user's message. If they express that they DID something or WANT to do something, extract that as an "action".

ACTION TYPES:
1. "food": If they ate something. ALWAYS estimate calories if not provided.
2. "activity": If they worked out, worked, or rested.
3. "journal": If they share a thought or reflection.
4. "goal": If they want to set a new goal. Extract "title" and estimate a "dueDate".
5. "health": If they mention steps, sleep, weight, or water. Extract "steps", "sleepHours", "sleepMinutes", "weight", or "waterIntake" as INTEGERS (no commas, no units).

Return JSON ONLY:
{
  "reply": "Your conversational response.",
  "actions": [
    { "type": "food", "mealType": "breakfast/lunch/dinner/snacks", "name": "Apple", "calories": 95 },
    { "type": "activity", "title": "coding", "category": "Work/Fitness/Social/Rest" },
    { "type": "journal", "content": "entry text" },
    { "type": "goal", "title": "Run 5k", "dueDate": "2025-12-24" },
    { "type": "health", "steps": 5000, "sleepHours": 7, "sleepMinutes": 30 }
  ]
}
If no action is needed, return an empty actions array.

CONTEXT:
${contextData}

USER: "${message}"
`;
        try {
            const responseText = await generateAIResponse(prompt, true);
            console.log("AI Raw Response:", responseText);

            const cleanJson = responseText.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleanJson);

            console.log("AI Parsed Actions:", parsed.actions);

            return NextResponse.json({
                success: true,
                reply: parsed.reply,
                actions: parsed.actions || []
            });
        } catch (error) {
            console.error("AI Provider Error:", error);

            // Fallback for visual feedback
            return NextResponse.json({
                success: true,
                reply: "I'm having trouble connecting to my brain (AI Providers failed). Please check your API keys in .env.local!",
                isMock: true
            });
        }

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
