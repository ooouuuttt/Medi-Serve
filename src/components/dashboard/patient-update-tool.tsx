"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generatePatientUpdate } from "@/ai/flows/patient-update-generator";
import type { Prescription } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  patientName: z.string().min(1, "Patient name is required."),
  medicineName: z.string().min(1, "Medicine name is required."),
  pickupTime: z.string().min(1, "Pickup time is required."),
  specialInstructions: z.string().optional(),
});

export function PatientUpdateTool({ prescription }: { prescription: Prescription }) {
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const allMedicineNames = prescription.medicines.map(m => m.name).join(', ');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: prescription.patientName,
      medicineName: allMedicineNames,
      pickupTime: "in 15-20 minutes",
      specialInstructions: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedMessage("");
    try {
      const result = await generatePatientUpdate({
        ...values,
        pharmacyName: "MediServe",
      });
      setGeneratedMessage(result.message);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate message. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast({
        title: "Copied!",
        description: "Message copied to clipboard.",
    })
  }

  return (
    <div className="grid gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="patientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="medicineName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicines</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="pickupTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Pickup Time</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specialInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Instructions</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Please ask for your package at counter 2." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate Patient Update
          </Button>
        </form>
      </Form>

      {generatedMessage && (
        <Card className="mt-4 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Generated Message</CardTitle>
            <CardDescription>Review and send this message to the patient.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{generatedMessage}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Clipboard className="mr-2 h-4 w-4"/>
                Copy Message
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
