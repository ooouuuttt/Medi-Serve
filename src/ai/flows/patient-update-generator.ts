'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized patient update messages.
 *
 * - generatePatientUpdate - A function that generates a patient update message.
 * - PatientUpdateInput - The input type for the generatePatientUpdate function.
 * - PatientUpdateOutput - The return type for the generatePatientUpdate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PatientUpdateInputSchema = z.object({
  patientName: z.string().describe('The name of the patient.'),
  medicineName: z.string().describe('The name of the medicine that is ready.'),
  pharmacyName: z.string().describe('The name of the pharmacy.'),
  pickupTime: z.string().describe('The estimated pickup time for the medicine.'),
  specialInstructions: z.string().optional().describe('Any special instructions for the patient, such as where to pickup the medicine or what to bring.'),
});
export type PatientUpdateInput = z.infer<typeof PatientUpdateInputSchema>;

const PatientUpdateOutputSchema = z.object({
  message: z.string().describe('The personalized confirmation message for the patient.'),
});
export type PatientUpdateOutput = z.infer<typeof PatientUpdateOutputSchema>;

export async function generatePatientUpdate(input: PatientUpdateInput): Promise<PatientUpdateOutput> {
  return patientUpdateFlow(input);
}

const patientUpdatePrompt = ai.definePrompt({
  name: 'patientUpdatePrompt',
  input: {schema: PatientUpdateInputSchema},
  output: {schema: PatientUpdateOutputSchema},
  prompt: `You are a helpful assistant that crafts personalized confirmation messages for patients when their prescriptions are ready for pickup.  Use a friendly and professional tone.

  Create a message for {{patientName}} whose medicine, {{medicineName}}, is ready for pickup at {{pharmacyName}} around {{pickupTime}}. Include any special instructions provided: {{{specialInstructions}}}.`,
});

const patientUpdateFlow = ai.defineFlow(
  {
    name: 'patientUpdateFlow',
    inputSchema: PatientUpdateInputSchema,
    outputSchema: PatientUpdateOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const {output} = await patientUpdatePrompt(input);
        return output!;
      } catch (error: any) {
        attempt++;
        if (error.message.includes('503') && attempt < maxRetries) {
          console.warn(`Attempt ${attempt} failed with 503 error. Retrying in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Failed to generate patient update after multiple retries.');
  }
);
