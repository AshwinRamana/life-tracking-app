import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        await dbConnect();

        // 1. Verify User
        const userId = await verifyAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Define "Today" range (UTC)
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setUTCHours(23, 59, 59, 999);

        // 3. Find logs for this user, created today
        const logs = await ActivityLog.find({
            user: userId,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ time: 1 }); // Sort by time string "08:00" -> "09:00"

        return NextResponse.json({ success: true, count: logs.length, data: logs }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
