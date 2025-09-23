'use server';

/**
 * @fileOverview An AI symptom checker.
 *
 * - checkSymptoms - A function that analyzes a description of symptoms and provides potential conditions and recommendations.
 * - SymptomCheckInput - The input type for the checkSymptoms function.
 * - SymptomCheckOutput - The return type for the checkSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomCheckInputSchema = z.object({
  symptomDescription: z.string().describe('A description of the patient\'s symptoms.'),
});
export type SymptomCheckInput = z.infer<typeof SymptomCheckInputSchema>;

const SymptomCheckOutputSchema = z.object({
  potentialConditions: z.string().describe('A list of possible medical conditions based on the symptoms, with a disclaimer that this is not a diagnosis.'),
  recommendation: z.string().describe('Recommended next steps, such as consulting a specific type of doctor or seeking immediate medical attention.'),
  suggestedMedicines: z.string().describe('A list of over-the-counter medicines that might help alleviate the symptoms, with a strong disclaimer to consult a doctor.'),
});
export type SymptomCheckOutput = z.infer<typeof SymptomCheckOutputSchema>;

export async function checkSymptoms(input: SymptomCheckInput): Promise<SymptomCheckOutput> {
  return symptomCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomCheckPrompt',
  input: {schema: SymptomCheckInputSchema},
  output: {schema: SymptomCheckOutputSchema},
  prompt: `You are an AI medical assistant. A user is describing their symptoms. Analyze the symptoms and provide potential conditions, a recommendation for next steps, and a list of potentially helpful over-the-counter medicines.

  **IMPORTANT**: Start every response with a clear, bold disclaimer: "**This is not a medical diagnosis. Consult with a healthcare professional for accurate advice.**"

  User's Symptoms:
  {{symptomDescription}}

  Based on these symptoms, provide:

  1.  **Potential Conditions**: List a few possibilities, explaining them briefly. Frame this as possibilities, not certainties.
  2.  **Recommendation**: Suggest what the user should do next (e.g., "It would be best to consult a General Physician," or "These symptoms warrant a visit to an emergency room.").
  3.  **Suggested Medicines**: List some common over-the-counter medications that might help with the described symptoms (e.g., "For a headache, Paracetamol or Ibuprofen could be considered."). Always include a disclaimer that they must consult a doctor or pharmacist before taking any medication.
  \nEnsure the output is well-formatted, empathetic, and prioritizes user safety.
`,
});

const symptomCheckFlow = ai.defineFlow(
  {
    name: 'symptomCheckFlow',
    inputSchema: SymptomCheckInputSchema,
    outputSchema: SymptomCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
