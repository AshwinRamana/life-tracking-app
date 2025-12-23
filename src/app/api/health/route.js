import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HealthLog from '@/models/HealthLog';
import { verifyAuth } from '@/lib/auth';

export async function POST(req) {
    try {
        await dbConnect();

        // 1. Verify User
        const userId = await verifyAuth(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        // 2. Get Data
        const body = await req.json();
        const { steps, sleepHours, sleepMinutes, weight, waterIntake } = body;

        // 3. Define "Today" (UTC)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // 4. Upsert (Partial updates allowed)
        const updateData = {};
        if (steps !== undefined) updateData.steps = Number(steps) || 0;
        if (sleepHours !== undefined) updateData.sleepHours = Number(sleepHours) || 0;
        if (sleepMinutes !== undefined) updateData.sleepMinutes = Number(sleepMinutes) || 0;
        if (weight !== undefined) updateData.weight = Number(weight) || 0;
        if (waterIntake !== undefined) updateData.waterIntake = Number(waterIntake) || 0;

        const dailyLog = await HealthLog.findOneAndUpdate(
            { user: userId, date: today },
            { $set: updateData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, data: dailyLog }, { status: 200 });

    } catch (error) {
        console.error("Health Log Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
