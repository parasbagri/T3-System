// src/lib/ai.js
import { GoogleGenAI } from "@google/genai";
import { env } from '$env/dynamic/private';

export async function enhanceTaskWithAI(userInput) {
    if (!env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not found. Using fallback.');
        return {
            title: userInput.charAt(0).toUpperCase() + userInput.slice(1),
            description: null
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

        const prompt = `You are a task management assistant. Given the user's natural language input, generate a clear, concise task title and a structured description. Return ONLY a valid JSON object with "title" and "description" fields. User input: "${userInput}"`;

        const result = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
		console.log('Gemini AI raw result:', result);
        const content = result.text;

        if (content) {
            try {
                const parsed = JSON.parse(content);
                return {
                    title: parsed.title || userInput,
                    description: parsed.description || null
                };
            } catch (e) {
                console.error('Failed to parse JSON from Gemini response:', e);
                return {
                    title: content.trim(),
                    description: null
                };
            }
        }
    } catch (error) {
        console.error('Gemini AI enhancement error:', error);
    }

    return {
        title: userInput.charAt(0).toUpperCase() + userInput.slice(1),
        description: null
    };
}

