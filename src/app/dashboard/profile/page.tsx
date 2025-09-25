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

const profileSchema = z.object({
  ownerName: z.string().min(2, "Name is too short"),
  pharmacyName: z.string().min(2, "Pharmacy name is too short"),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user-avatar');
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ownerName: "",
      pharmacyName: "",
      email: "",
    },
  });

  useEffect(() => {
    async function fetchProfile() {
      if (auth?.currentUser && firestore) {
        setIsLoading(true);
        try {
          const docRef = doc(firestore, "pharmacies", auth.currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as ProfileFormValues;
            form.reset(data);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch profile data.",
          });
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (auth?.currentUser) {
        fetchProfile();
    } else {
        // Handle case where user is not logged in or auth is not ready
        // For now, we can just stop loading. A better solution might involve a listener.
        setIsLoading(false);
    }
  }, [auth, firestore, form, toast]);


  const onSubmit = async (data: ProfileFormValues) => {
    if (!auth?.currentUser || !firestore) {
        toast({ variant: "destructive", title: "Error", description: "Firebase not initialized." });
        return;
    }

    setIsSaving(true);
    try {
        const docRef = doc(firestore, "pharmacies", auth.currentUser.uid);
        await setDoc(docRef, data, { merge: true }); // Use merge to avoid overwriting other fields
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
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
      // Re-fetch data to discard changes
       if (auth?.currentUser && firestore) {
        const docRef = doc(firestore, "pharmacies", auth.currentUser.uid);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                form.reset(docSnap.data() as ProfileFormValues);
            }
        });
      }
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
                {isLoading ? (
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="grid gap-2">
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                    </div>
                ) : (
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
                )}

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Name</FormLabel>
                      <FormControl>
                        {isLoading ? <Skeleton className="h-10" /> : <Input {...field} disabled={!isEditing} />}
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
                         {isLoading ? <Skeleton className="h-10" /> : <Input {...field} disabled={!isEditing} />}
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
                       {isLoading ? <Skeleton className="h-10" /> : <Input {...field} disabled />}
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
                    <Button onClick={() => setIsEditing(true)} disabled={isLoading}>
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
