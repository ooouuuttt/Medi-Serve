"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { checkSymptoms } from "@/ai/flows/symptom-checker";
import type { SymptomCheckOutput } from "@/ai/flows/symptom-checker";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Wand2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  symptoms: z.string().min(10, "Please describe your symptoms in more detail."),
});

export default function SymptomCheckerPage() {
  const [analysisResult, setAnalysisResult] = useState<SymptomCheckOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await checkSymptoms({
        symptomDescription: values.symptoms,
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze symptoms. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight">AI Symptom Checker</h1>
      <Card>
        <CardHeader>
          <CardTitle>Describe Your Symptoms</CardTitle>
          <CardDescription>
            Enter your symptoms below and our AI will provide a preliminary analysis and suggest next steps. This is not a substitute for professional medical advice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I have a headache, a slight fever, and a runny nose for the last 2 days."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Analyze Symptoms
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {analysisResult && (
        <>
          <Separator />
          <Card>
            <CardHeader>
                <CardTitle>Analysis Result</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Potential Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{analysisResult.potentialConditions}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Recommended Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{analysisResult.recommendation}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Suggested Medicines</CardTitle>
                        <CardDescription>These are potential over-the-counter options. Consult a doctor before taking any medication.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{analysisResult.suggestedMedicines}</p>
                    </CardContent>
                </Card>
            </CardContent>
            <CardFooter>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Book a Teleconsultation
                </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
