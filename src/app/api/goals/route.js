import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Goal from '@/models/Goal';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const userId = await verifyAuth(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const goals = await Goal.find({ user: userId, completed: false }).sort({ dueDate: 1 });
        return NextResponse.json({ success: true, data: goals });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const userId = await verifyAuth(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { title, dueDate } = await req.json();
        const newGoal = await Goal.create({
            user: userId,
            title,
            dueDate: new Date(dueDate)
        });

        return NextResponse.json({ success: true, data: newGoal });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await dbConnect();
        const userId = await verifyAuth(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { goalId, completed } = await req.json();
        const goal = await Goal.findOneAndUpdate(
            { _id: goalId, user: userId },
            { completed },
            { new: true }
        );

        return NextResponse.json({ success: true, data: goal });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
