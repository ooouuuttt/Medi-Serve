
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
  highestDemandMedicines: z.array(z.object({
    name: z.string().describe('The name of the medicine.'),
    quantity: z.number().describe('The total quantity sold or prescribed.'),
    reason: z.string().describe('A brief reason for its high demand.'),
  })).describe('A list of the top 5 medicines in highest demand.'),
  futureStockPredictions: z.array(z.object({
    name: z.string().describe('The name of the month.'),
    total: z.number().describe('The predicted sales quantity for that month.'),
  })).describe('Predictions for future stock needs for the next few months.'),
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

  1. A structured list of the top 5 medicines in highest demand, with the medicine name, total quantity, and a brief reason.
  2. A structured list of predicted sales for the next 6 months in the format { name: "Month", total: predicted_quantity }. Use the provided data to forecast, creating a realistic trend with some variability month-to-month. For example, use months like 'July', 'August', 'September', 'October', 'November', 'December'.
  3. A string containing specific, actionable suggestions for optimizing stock levels to minimize shortages and maximize sales.
  \n  Ensure the output matches the required JSON schema precisely.
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
