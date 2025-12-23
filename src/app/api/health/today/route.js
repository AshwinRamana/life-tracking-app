import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HealthLog from '@/models/HealthLog';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        await dbConnect();

        const userId = await verifyAuth(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        let log = await HealthLog.findOne({ user: userId, date: today });

        // Return default 0s if no log exists today
        if (!log) {
            log = {
                steps: 0,
                sleepHours: 0,
                sleepMinutes: 0,
                weight: 0,
                waterIntake: 0
            };
        }

        return NextResponse.json({ success: true, data: log }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
