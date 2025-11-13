import { error, json } from '@sveltejs/kit';
import { enhanceTaskWithAI } from '$lib/ai.js';
import { z } from 'zod';

const enhanceSchema = z.object({
	userInput: z.string().min(1)
});

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { userInput } = enhanceSchema.parse(body);
		console.log('Received user input for AI enhancement:', userInput);

		const enhanced = await enhanceTaskWithAI(userInput);
		console.log('Enhanced task from AI:', enhanced);
		console.log(error);

		return json({ ...enhanced });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid input', details: error.errors }, { status: 400 });
		}
		console.error('AI enhance error:', error);
		return json({ error: 'Failed to enhance task' }, { status: 500 });
	}
}

