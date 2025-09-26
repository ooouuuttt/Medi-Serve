
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Medicine } from "@/lib/types";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  manufacturer: z.string().min(2, { message: "Manufacturer must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  requiresPrescription: z.boolean().default(false),
  quantity: z.coerce.number().min(0, { message: "Quantity can't be negative." }),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  price: z.coerce.number().min(0, { message: "Price can't be negative." }),
  lowStockThreshold: z.coerce.number().min(0, { message: "Threshold can't be negative." }),
});

type AddMedicineFormProps = {
    onAddMedicine: (medicine: Omit<Medicine, 'id'>) => Promise<void>;
    onFinished: () => void;
}

export function AddMedicineForm({ onAddMedicine, onFinished }: AddMedicineFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      manufacturer: "",
      description: "",
      requiresPrescription: false,
      quantity: 0,
      expiryDate: "",
      price: 0,
      lowStockThreshold: 10,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        await onAddMedicine(values);
        toast({
            title: "Medicine Added",
            description: `${values.name} has been added to your inventory.`,
        });
        form.reset();
        onFinished();
    } catch (error) {
        console.error("Error adding medicine:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add medicine. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Medicine Name</FormLabel>
                <FormControl>
                    <Input placeholder="Paracetamol" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="manufacturer"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Manufacturer</FormLabel>
                <FormControl>
                    <Input placeholder="Calpol" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
         <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                    <Textarea placeholder="Used for pain relief..." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                    <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Low Stock Threshold</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
         <FormField
            control={form.control}
            name="requiresPrescription"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Requires Prescription</FormLabel>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                </FormItem>
            )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Medicine
        </Button>
      </form>
    </Form>
  );
}
