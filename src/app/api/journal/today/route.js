import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import JournalLog from '@/models/JournalLog';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        await dbConnect();

        const userId = await verifyAuth(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        let journal = await JournalLog.findOne({ user: userId, date: today });

        // Return empty content if not started yet
        if (!journal) {
            journal = { content: '' };
        }

        return NextResponse.json({ success: true, data: journal }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
