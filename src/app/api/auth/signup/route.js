import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    try {
        await dbConnect();

        // 1. Get data from request
        const { email, password, name } = await req.json();

        // 2. Validate input
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Please provide email and password' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // 3. Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return NextResponse.json(
                { success: false, error: 'User already exists' },
                { status: 400 }
            );
        }

        // 4. Create user
        // The pre('save') middleware in User.js will hash the password automatically
        const user = await User.create({
            email,
            password,
            name,
        });

        // 5. Create token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        // 6. Return response (excluding password)
        return NextResponse.json(
            {
                success: true,
                token,
                user: { id: user._id, name: user.name, email: user.email }
            },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
