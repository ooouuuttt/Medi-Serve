"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import placeholderImages from '@/lib/placeholder-images.json';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil, Save, X } from "lucide-react";

const profileSchema = z.object({
  ownerName: z.string().min(2, "Name is too short"),
  pharmacyName: z.string().min(2, "Pharmacy name is too short"),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user-avatar');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ownerName: "Medico Owner",
      pharmacyName: "MediServe",
      email: "owner@mediserve.com",
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    setIsSaving(true);
    console.log("Saving data:", data);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    }, 1500);
  };
  
  const handleCancel = () => {
      form.reset(); // Resets form to defaultValues
      setIsEditing(false);
  }

  return (
    <div className="grid gap-6">
       <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24">
                        {userAvatar && <AvatarImage src={userAvatar.imageUrl} data-ai-hint={userAvatar.imageHint} />}
                        <AvatarFallback>MO</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <h2 className="text-2xl font-bold">{form.watch('ownerName')}</h2>
                        <p className="text-muted-foreground">{form.watch('pharmacyName')}</p>
                    </div>
                </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pharmacyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pharmacy Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isEditing} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                )}
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
