// src/lib/ai.js
import { GoogleGenAI } from "@google/genai";
import { env } from '$env/dynamic/private';

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export async function enhanceTaskWithAI(userInput) {
	if (!env.GEMINI_API_KEY) {
		console.warn('GEMINI_API_KEY not found. Using fallback.');
		return {
			title: userInput.charAt(0).toUpperCase() + userInput.slice(1),
			description: null
		};
	}

	const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
	const prompt = `You are a task management assistant. Given the user's natural language input, generate a clear, concise task title and a  description. Return ONLY a valid JSON object with "title" and "description" fields. User input: "${userInput}"`;

	const maxRetries = 10;
	let attempt = 0;

	while (attempt < maxRetries) {
		try {
			// Reverted to the ai.models.generateContent syntax from your original code
			const result = await ai.models.generateContent({
				model: "gemini-2.5-flash", // Using a potentially more available model
				contents: prompt
			});

			// Accessing the result text directly as in your original code
			const content = result.text;

			if (content) {
				try {
					// Regular expression to find a JSON object within a Markdown code block
					const jsonRegex = /```json\n([\s\S]*?)\n```/;
					const match = content.match(jsonRegex);

					// If a match is found, parse the captured group, otherwise parse the original content
					const jsonToParse = match ? match[1] : content;
					const parsed = JSON.parse(jsonToParse);

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
			// The error log shows a 'status' property on the error object
			if (error.status === 503 && attempt < maxRetries - 1) {
				const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
				console.warn(`Gemini model overloaded. Retrying in ${delay}ms...`);
				await sleep(delay);
				attempt++;
			} else {
				console.error('Gemini AI enhancement error:', error);
				break; // Exit loop on other errors or max retries
			}
		}
	}

	// Fallback if all retries fail
	return {
		title: userInput.charAt(0).toUpperCase() + userInput.slice(1),
		description: null
	};
}
