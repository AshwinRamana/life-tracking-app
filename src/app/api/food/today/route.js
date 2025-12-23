import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FoodLog from '@/models/FoodLog';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        await dbConnect();

        const userId = await verifyAuth(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const log = await FoodLog.findOne({ user: userId, date: today });

        // Return empty structure if nothing logged yet, to prevent frontend null errors
        if (!log) {
            return NextResponse.json({
                success: true,
                data: { breakfast: [], lunch: [], dinner: [], snacks: [], totalCalories: 0 }
            }, { status: 200 });
        }

        return NextResponse.json({ success: true, data: log }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
