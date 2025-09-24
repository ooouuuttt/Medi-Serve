
'use server';

/**
 * @fileOverview A sales trend analysis AI agent.
 *
 * - analyzeSalesTrends - A function that analyzes sales data and prescription trends to identify high-demand medicines and predict future needs.
 * - AnalyzeSalesTrendsInput - The input type for the analyzeSalesTrends function.
 * - AnalyzeSalesTrendsOutput - The return type for the analyzeSalesTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSalesTrendsInputSchema = z.object({
  salesData: z.string().describe('Sales data for the past year, in CSV format with columns: Medicine Name, Manufacturer, Quantity Sold, Date.'),
  prescriptionTrends: z.string().describe('Prescription trends data for the past year, in CSV format with columns: Medicine Name, Doctor Specialty, Frequency, Date.'),
});
export type AnalyzeSalesTrendsInput = z.infer<typeof AnalyzeSalesTrendsInputSchema>;

const AnalyzeSalesTrendsOutputSchema = z.object({
  highestDemandMedicines: z.string().describe('A list of the top 5 medicines in highest demand, with reasons for their demand.'),
  futureStockPredictions: z.string().describe('Predictions for future stock needs, including seasonal variations and potential shortages.'),
  stockOptimizationSuggestions: z.string().describe('Suggestions for optimizing stock levels based on the analysis.'),
});
export type AnalyzeSalesTrendsOutput = z.infer<typeof AnalyzeSalesTrendsOutputSchema>;

export async function analyzeSalesTrends(input: AnalyzeSalesTrendsInput): Promise<AnalyzeSalesTrendsOutput> {
  return analyzeSalesTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSalesTrendsPrompt',
  input: {schema: AnalyzeSalesTrendsInputSchema},
  output: {schema: AnalyzeSalesTrendsOutputSchema},
  prompt: `You are an AI assistant helping medical owners optimize their stock levels.

  Analyze the provided sales data and prescription trends to identify which medicines are in highest demand and predict future stock needs.

  Sales Data:
  {{salesData}}

  Prescription Trends:
  {{prescriptionTrends}}

  Based on this data, provide:

  1. A list of the top 5 medicines in highest demand, with clear reasons for their demand.
  2. Predictions for future stock needs, including any seasonal variations and potential shortages.
  3. Specific, actionable suggestions for optimizing stock levels to minimize shortages and maximize sales.
  \n  Ensure the output is well-formatted and easy to understand.
`,
});

const analyzeSalesTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeSalesTrendsFlow',
    inputSchema: AnalyzeSalesTrendsInputSchema,
    outputSchema: AnalyzeSalesTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
