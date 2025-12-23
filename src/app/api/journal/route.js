import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import JournalLog from '@/models/JournalLog';
import { verifyAuth } from '@/lib/auth';

export async function POST(req) {
    try {
        await dbConnect();

        // 1. Verify User
        const userId = await verifyAuth(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        // 2. Get Data
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
        }

        // 3. Define "Today" (UTC)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // 4. Upsert (Push new entry)
        const journal = await JournalLog.findOneAndUpdate(
            { user: userId, date: today },
            {
                $push: { entries: { content, timestamp: new Date() } },
                $set: { updatedAt: new Date() }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, data: journal }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await dbConnect();
        const userId = await verifyAuth(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const journal = await JournalLog.findOne({ user: userId, date: today });

        return NextResponse.json({ success: true, data: journal }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
