import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        enum: ['Work', 'Food', 'Fitness', 'Social', 'Rest', 'Other'],
        required: [true, 'Please provide a category'],
    },
    title: {
        type: String,
        required: [true, 'Please provide a description/title'],
    },
    time: {
        type: String, // Storing as "HH:MM" string for simplicity matching UI
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
