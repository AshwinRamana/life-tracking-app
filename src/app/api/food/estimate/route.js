import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { generateAIResponse } from '@/lib/aiProvider';

export async function POST(req) {
    try {
        const userId = await verifyAuth(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { foodName } = await req.json();
        if (!foodName) return NextResponse.json({ success: false, error: 'Food name is required' }, { status: 400 });

        const prompt = `
Estimate the calories for a standard serving of: "${foodName}".
Provide a realistic number.

Return JSON ONLY:
{ "calories": 350 }
`;

        try {
            const responseText = await generateAIResponse(prompt, true);
            const cleanJson = responseText.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleanJson);

            return NextResponse.json({
                success: true,
                calories: parsed.calories || 0
            });
        } catch (error) {
            console.error("Food Estimate AI Error:", error);
            // Default to 0 if AI fails, user can enter manually
            return NextResponse.json({ success: true, calories: 0, isMock: true });
        }

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
