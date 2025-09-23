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

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  brand: z.string().min(2, { message: "Brand must be at least 2 characters." }),
  quantity: z.coerce.number().min(0, { message: "Quantity can't be negative." }),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  price: z.coerce.number().min(0, { message: "Price can't be negative." }),
  lowStockThreshold: z.coerce.number().min(0, { message: "Threshold can't be negative." }),
});

type AddMedicineFormProps = {
    onAddMedicine: (medicine: Omit<Medicine, 'id'>) => void;
}

export function AddMedicineForm({ onAddMedicine }: AddMedicineFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      brand: "",
      quantity: 0,
      expiryDate: "",
      price: 0,
      lowStockThreshold: 10,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onAddMedicine(values);
      toast({
        title: "Medicine Added",
        description: `${values.name} has been added to the inventory.`,
      });
      setIsLoading(false);
      form.reset();
    }, 1000);
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
            name="brand"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                    <Input placeholder="Calpol" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Medicine
        </Button>
      </form>
    </Form>
  );
}
