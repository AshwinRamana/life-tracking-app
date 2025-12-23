import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

export const verifyAuth = async (req) => {
    try {
        const headersList = await headers();
        const token = headersList.get('authorization')?.split(' ')[1];

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (error) {
        return null;
    }
};
