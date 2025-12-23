import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import DailySummary from '@/models/DailySummary';
import { verifyAuth } from '@/lib/auth';
import { getDailyContext } from '@/lib/dataContext';
import { generateAIResponse } from '@/lib/aiProvider';

export async function POST(req) {
    try {
        await dbConnect();
        const userId = await verifyAuth(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const contextData = await getDailyContext(userId);

        const prompt = `
YOU ARE A PERSONAL LIFE COACH. 
Analyze the user's day based on this data:
${contextData}

TASK:
1. Write a short summary (max 3 sentences).
2. Rate mood/productivity (1-10).
3. Suggest 1 action item.
4. From the context, deduce a short "Current Mood" (text + 1 emoji) and "Current Focus" (text, max 2 words).

Return JSON ONLY:
{ 
  "summary": "...", 
  "moodScore": 8, 
  "actionItem": "...",
  "suggestedMood": "Reflective 🧘",
  "suggestedFocus": "Self Growth"
}
`;

        let summaryText, moodScore, actionItem, suggestedMood, suggestedFocus;
        let isMock = false;

        try {
            const responseText = await generateAIResponse(prompt, true);
            // Clean markdown blocks if present
            const cleanJson = responseText.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleanJson);

            summaryText = parsed.summary;
            moodScore = parsed.moodScore;
            actionItem = parsed.actionItem;
            suggestedMood = parsed.suggestedMood;
            suggestedFocus = parsed.suggestedFocus;
        } catch (error) {
            console.error("Summary AI Error:", error);
            isMock = true;
            summaryText = "I noticed you're doing great! (AI providers are currently unreachable. Check your .env.local for GROQ_API_KEY or GEMINI_API_KEY)";
            moodScore = 7;
            actionItem = "Continue tracking your day!";
            suggestedMood = "Calm 😌";
            suggestedFocus = "Momentum";
        }

        // --- Save to DB ---
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const savedSummary = await DailySummary.findOneAndUpdate(
            { user: userId, date: today },
            {
                summaryContent: summaryText,
                moodScore: moodScore,
                actionItems: [actionItem]
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({
            success: true,
            data: {
                ...savedSummary.toObject(),
                suggestedMood,
                suggestedFocus
            },
            isMock: isMock
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
