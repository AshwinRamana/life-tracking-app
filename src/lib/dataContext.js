import ActivityLog from '@/models/ActivityLog';
import FoodLog from '@/models/FoodLog';
import HealthLog from '@/models/HealthLog';
import JournalLog from '@/models/JournalLog';

export async function getDailyContext(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Fetch all data in parallel
    const [activities, food, health, journal] = await Promise.all([
        ActivityLog.find({ user: userId, createdAt: { $gte: today, $lte: endOfDay } }).lean(),
        FoodLog.findOne({ user: userId, date: today }).lean(),
        HealthLog.findOne({ user: userId, date: today }).lean(),
        JournalLog.findOne({ user: userId, date: today }).lean(),
    ]);

    // 2. Format it into a specialized "Prompt Context" string
    let contextString = `Date: ${today.toDateString()}\n\n`;

    // Activity
    contextString += `[ACTIVITIES]\n`;
    if (activities.length > 0) {
        activities.forEach(a => contextString += `- ${a.time}: ${a.title} (${a.category})\n`);
    } else {
        contextString += `No activities logged.\n`;
    }
    contextString += `\n`;

    // Food
    contextString += `[NUTRITION]\n`;
    if (food) {
        contextString += `Total Calories: ${food.totalCalories}\n`;
        ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(meal => {
            if (food[meal]?.length > 0) {
                contextString += `${meal.toUpperCase()}: ` + food[meal].map(f => `${f.name} (${f.calories})`).join(', ') + '\n';
            }
        });
    } else {
        contextString += `No food logged.\n`;
    }
    contextString += `\n`;

    // Health
    contextString += `[HEALTH METRICS]\n`;
    if (health) {
        contextString += `Steps: ${health.steps}\n`;
        contextString += `Sleep: ${health.sleepHours}h ${health.sleepMinutes}m\n`;
        contextString += `Weight: ${health.weight || 'Not logged'}\n`;
        contextString += `Water: ${health.waterIntake}ml\n`;
    } else {
        contextString += `No health metrics logged.\n`;
    }
    contextString += `\n`;

    // Journal
    contextString += `[JOURNAL / THOUGHTS]\n`;
    if (journal && journal.entries?.length > 0) {
        journal.entries.forEach(e => {
            contextString += `- [${new Date(e.timestamp).toLocaleTimeString()}]: ${e.content}\n`;
        });
    } else {
        contextString += `No journal entries today.\n`;
    }

    return contextString;
}
