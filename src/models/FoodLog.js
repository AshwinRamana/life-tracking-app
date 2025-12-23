import mongoose from 'mongoose';

const FoodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    calories: { type: Number, required: true },
});

// We use the "Bucket Pattern" here: One document per day per user.
// This makes fetching the entire day's dashboard very fast (1 query).
const FoodLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    // Arrays of food items
    breakfast: [FoodItemSchema],
    lunch: [FoodItemSchema],
    dinner: [FoodItemSchema],
    snacks: [FoodItemSchema],

    // Total calories for the day (can be auto-calculated)
    totalCalories: {
        type: Number,
        default: 0,
    }
});

// Create a compound index so a user can't have two documents for the same day
// (Though typically we'll handle this in the API logic too)
FoodLogSchema.index({ user: 1, date: 1 }); // We will query by range usually, but unique compound is optional if we use "date" as range

export default mongoose.models.FoodLog || mongoose.model('FoodLog', FoodLogSchema);
