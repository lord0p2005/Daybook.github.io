'use server';

/**
 * @fileOverview This file defines a Genkit flow for categorizing daily log entries using AI.
 *
 * - categorizeLogEntry - A function that categorizes a log entry.
 * - CategorizeLogEntryInput - The input type for the categorizeLogEntry function.
 * - CategorizeLogEntryOutput - The return type for the categorizeLogEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeLogEntryInputSchema = z.object({
  logEntry: z.string().describe('The daily log entry to categorize.'),
});
export type CategorizeLogEntryInput = z.infer<typeof CategorizeLogEntryInputSchema>;

const CategorizeLogEntryOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'The main category of the log entry. Possible categories include: Work, Personal, Health, Social, Travel, Learning, Errands, Philosophy, Other.'
    ),
  subcategory: z
    .string()
    .optional()
    .describe(
      'A more specific sub-category. For "Learning", this could be "Math", "Biology", "History", "Programming", etc. For other categories, this can be omitted or provide finer detail if obvious and concise.'
    ),
  confidence: z
    .number()
    .describe('A number between 0 and 1 indicating the confidence in the category assignment.'),
});
export type CategorizeLogEntryOutput = z.infer<typeof CategorizeLogEntryOutputSchema>;

export async function categorizeLogEntry(input: CategorizeLogEntryInput): Promise<CategorizeLogEntryOutput> {
  return categorizeLogEntryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeLogEntryPrompt',
  input: {schema: CategorizeLogEntryInputSchema},
  output: {schema: CategorizeLogEntryOutputSchema},
  prompt: `You are an AI assistant that categorizes daily log entries.

  Given the following log entry, determine the most appropriate main category, a potential sub-category, and a confidence score between 0 and 1 for the main category.

  Log Entry: {{{logEntry}}}

  Ensure that the main category is one of the following: Work, Personal, Health, Social, Travel, Learning, Errands, Philosophy, Other.
  If the main category is "Learning", please identify a specific sub-category (e.g., Math, Biology, History, Programming, Language, Music Theory).
  For other main categories, a sub-category can be provided if it offers useful, concise detail, but it's optional.
  `,
});

const categorizeLogEntryFlow = ai.defineFlow(
  {
    name: 'categorizeLogEntryFlow',
    inputSchema: CategorizeLogEntryInputSchema,
    outputSchema: CategorizeLogEntryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
