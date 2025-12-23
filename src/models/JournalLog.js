import mongoose from 'mongoose';

const JournalLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    entries: [{
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    // Keep 'updatedAt' for general sync
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// One journal entry per day per user
JournalLogSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.models.JournalLog || mongoose.model('JournalLog', JournalLogSchema);
