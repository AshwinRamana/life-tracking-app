import mongoose from 'mongoose';

const HealthLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    steps: {
        type: Number,
        default: 0,
    },
    sleepHours: {
        type: Number,
        default: 0,
    },
    sleepMinutes: {
        type: Number,
        default: 0,
    },
    weight: {
        type: Number,
        default: 0,
    },
    waterIntake: {
        type: Number,
        default: 0, // e.g., in ml
    }
});

// Enforce one health log per user per day
HealthLogSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.models.HealthLog || mongoose.model('HealthLog', HealthLogSchema);
