import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FoodLog from '@/models/FoodLog';
import { verifyAuth } from '@/lib/auth';

export async function POST(req) {
    try {
        await dbConnect();

        // 1. Verify User
        const userId = await verifyAuth(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { mealType, name, calories } = await req.json(); // mealType: 'breakfast', 'lunch'...

        if (!['breakfast', 'lunch', 'dinner', 'snacks'].includes(mealType)) {
            return NextResponse.json({ success: false, error: 'Invalid meal type' }, { status: 400 });
        }

        // 2. Define "Today" (Normalization is crucial here)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // 3. Find today's document or create it
        let dailyLog = await FoodLog.findOne({
            user: userId,
            date: today
        });

        if (!dailyLog) {
            dailyLog = await FoodLog.create({
                user: userId,
                date: today,
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: [],
                totalCalories: 0
            });
        }

        // 4. Add the food item
        const newItem = { name, calories: Number(calories) };
        dailyLog[mealType].push(newItem);
        dailyLog.totalCalories += newItem.calories;

        await dailyLog.save();

        return NextResponse.json({ success: true, data: dailyLog }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
