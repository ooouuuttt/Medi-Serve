
"use client";

import { useState, useEffect } from "react";
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
import { useAuth, useFirestore } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CustomSwitch } from "@/components/ui/custom-switch";
import { useDashboard } from "@/context/dashboard-context";


const profileSchema = z.object({
  ownerName: z.string().min(2, "Name is too short"),
  pharmacyName: z.string().min(2, "Pharmacy name is too short"),
  email: z.string().email(),
  location: z.string().optional(),
  timings: z.string().optional(),
  contactNumber: z.string().optional(),
  isOpen: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user-avatar');
  const auth = useAuth();
  const firestore = useFirestore();
  const { profile, isProfileLoading, fetchProfile, setPharmacyStatus } = useDashboard();


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ownerName: "",
      pharmacyName: "",
      email: "",
      location: "",
      timings: "",
      contactNumber: "",
      isOpen: true,
    },
  });

  const isOpen = form.watch("isOpen");

  useEffect(() => {
    if (profile) {
      form.reset(profile);
    }
  }, [profile, form]);


  const onSubmit = async (data: ProfileFormValues) => {
    if (!auth?.currentUser || !firestore) {
        toast({ variant: "destructive", title: "Error", description: "You are not logged in or database is not available." });
        return;
    }

    setIsSubmitting(true);
    try {
        const docRef = doc(firestore, "pharmacies", auth.currentUser.uid);
        await setDoc(docRef, data, { merge: true });
        await fetchProfile(); // Refetch profile to update context
        setIsEditing(false);
        toast({
            title: "Profile Updated",
            description: "Your changes have been saved successfully.",
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not save your changes.",
        });
    }
    finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
       if (profile) {
         form.reset(profile);
       }
      setIsEditing(false);
  }

  const handleStatusChange = async (newStatus: boolean) => {
    setIsSubmitting(true);
    try {
      await setPharmacyStatus(newStatus);
      form.setValue("isOpen", newStatus);
      toast({
        title: "Status Updated",
        description: `Your pharmacy is now marked as ${newStatus ? "Open" : "Closed"}.`,
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the status.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


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
                {isProfileLoading ? (
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="grid gap-2">
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <Avatar className="h-24 w-24">
                              {userAvatar && <AvatarImage src={userAvatar.imageUrl} data-ai-hint={userAvatar.imageHint} />}
                              <AvatarFallback>{form.getValues('ownerName')?.substring(0, 2).toUpperCase() || 'MO'}</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-1">
                              <h2 className="text-2xl font-bold">{form.watch('ownerName')}</h2>
                              <p className="text-muted-foreground">{form.watch('pharmacyName')}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <div className="cursor-pointer">
                                <CustomSwitch
                                  checked={isOpen}
                                  onCheckedChange={() => {}} // Dialog trigger handles the click
                                  disabled={isSubmitting}
                                />
                              </div>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to change your pharmacy status to {isOpen ? "Closed" : "Open"}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleStatusChange(!isOpen)}>
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </div>
                    </div>
                )}

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Name</FormLabel>
                      <FormControl>
                        {isProfileLoading ? <Skeleton className="h-10" /> : <Input {...field} disabled={!isEditing} />}
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
                         {isProfileLoading ? <Skeleton className="h-10" /> : <Input {...field} disabled={!isEditing} />}
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                <div className="grid md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                         {isProfileLoading ? <Skeleton className="h-10" /> : <Input {...field} disabled />}
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        {isProfileLoading ? <Skeleton className="h-10" /> : <Input placeholder="e.g., +91 1234567890" {...field} disabled={!isEditing} />}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        {isProfileLoading ? <Skeleton className="h-10" /> : <Input placeholder="e.g., 123 Main St, Anytown" {...field} disabled={!isEditing} />}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timings</FormLabel>
                      <FormControl>
                         {isProfileLoading ? <Skeleton className="h-10" /> : <Input placeholder="e.g., Mon-Fri: 9am-6pm" {...field} disabled={!isEditing} />}
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button onClick={() => setIsEditing(true)} disabled={isProfileLoading}>
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
