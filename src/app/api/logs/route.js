import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';
import { verifyAuth } from '@/lib/auth';

export async function POST(req) {
    try {
        await dbConnect();

        // 1. Verify User
        const userId = await verifyAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get Data
        const { category, title, time } = await req.json();

        // 3. Validate
        if (!category || !title || !time) {
            return NextResponse.json(
                { success: false, error: 'Please provide category, title, and time' },
                { status: 400 }
            );
        }

        // 4. Create Log
        const log = await ActivityLog.create({
            user: userId,
            category,
            title,
            time,
            // Date defaults to Date.now(), but you could pass it in too
        });

        return NextResponse.json({ success: true, data: log }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
