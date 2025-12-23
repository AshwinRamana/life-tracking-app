import mongoose from 'mongoose';

const DailySummarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    summaryContent: {
        type: String,
        required: true,
    },
    moodScore: {
        type: Number, // AI estimated mood 1-10
        default: 5,
    },
    actionItems: [String], // AI suggested tasks for tomorrow
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

DailySummarySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.models.DailySummary || mongoose.model('DailySummary', DailySummarySchema);
