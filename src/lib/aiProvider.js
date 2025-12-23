
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateAIResponse(prompt, jsonMode = false) {
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    // --- Strategy 1: Try Groq (Usually much faster and better free tier) ---
    if (groqKey) {
        try {
            console.log("[AI] Attempting with Groq (Llama 3)...");
            const groq = new OpenAI({
                apiKey: groqKey,
                baseURL: "https://api.groq.com/openai/v1",
            });

            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                response_format: jsonMode ? { type: "json_object" } : undefined,
            });

            console.log("[AI] Success with Groq.");
            return completion.choices[0].message.content;
        } catch (error) {
            console.error("[AI] Groq Error:", error.message);
            // Fall through to Gemini
        }
    }

    // --- Strategy 2: Try Gemini ---
    if (geminiKey) {
        try {
            console.log("[AI] Attempting with Gemini...");
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("[AI] Success with Gemini.");
            return response.text();
        } catch (error) {
            console.error("[AI] Gemini Error:", error.message);
        }
    }

    throw new Error("No AI providers succeeded or no keys provided.");
}
