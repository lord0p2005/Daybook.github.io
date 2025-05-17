// Use server directive is required for Genkit Flows.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for prompting the user with AI-generated questions about their day.
 *
 * - aiPromptDailyLog: The main function to initiate the AI-prompted daily log process.
 * - AIPromptDailyLogInput: The input type for the aiPromptDailyLog function.
 * - AIPromptDailyLogOutput: The output type for the aiPromptDailyLog function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const AIPromptDailyLogInputSchema = z.object({
  previousLogs: z.string().optional().describe('Previous daily logs to provide context.'),
});
export type AIPromptDailyLogInput = z.infer<typeof AIPromptDailyLogInputSchema>;

// Define the output schema
const AIPromptDailyLogOutputSchema = z.object({
  promptQuestions: z.array(
    z.string().describe('AI-generated questions to prompt the user about their day.')
  ).describe('An array of AI-generated questions.'),
});
export type AIPromptDailyLogOutput = z.infer<typeof AIPromptDailyLogOutputSchema>;

// Define the main function
export async function aiPromptDailyLog(input: AIPromptDailyLogInput): Promise<AIPromptDailyLogOutput> {
  return aiPromptDailyLogFlow(input);
}

// Define the prompt
const prompt = ai.definePrompt({
  name: 'aiPromptDailyLogPrompt',
  input: {schema: AIPromptDailyLogInputSchema},
  output: {schema: AIPromptDailyLogOutputSchema},
  prompt: `You are a personal AI assistant designed to help users recall their daily activities.

  Based on any previous logs provided, generate a list of questions to prompt the user about their day.
  The goal is to help them remember what they did and create a comprehensive daily log.
  The questions should be open-ended and encourage detailed responses.

  Previous Logs: {{{previousLogs}}}

  Generate 3-5 questions.
  Ensure that the questions are diverse and cover different aspects of a typical day (e.g., work, personal life, health, social interactions).
  Format the questions as an array of strings.
  `,
});

// Define the flow
const aiPromptDailyLogFlow = ai.defineFlow(
  {
    name: 'aiPromptDailyLogFlow',
    inputSchema: AIPromptDailyLogInputSchema,
    outputSchema: AIPromptDailyLogOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
