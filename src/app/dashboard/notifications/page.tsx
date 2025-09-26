"use client";

import { useState, useEffect } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Notification } from "@/lib/types";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, AlertTriangle, ClipboardType } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const auth = useAuth();
    const firestore = useFirestore();

    useEffect(() => {
        const fetchNotifications = async () => {
            if (auth?.currentUser && firestore) {
                try {
                    const notificationsCollectionRef = collection(firestore, "pharmacies", auth.currentUser.uid, "MediNotify");
                    const querySnapshot = await getDocs(notificationsCollectionRef);
                    const notificationsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
                    setNotifications(notificationsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                } catch (error) {
                    console.error("Error fetching notifications:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, [auth, firestore]);

    return (
        <div className="grid gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Notifications</CardTitle>
                    <CardDescription>A log of all alerts and updates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isLoading ? (
                             [...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-lg border">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 grid gap-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id} className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border", 
                                    n.isRead ? "bg-card" : "bg-primary/5 border-primary/20"
                                )}>
                                    <div className={cn("rounded-full p-2 mt-1", 
                                        n.type === 'low-stock' && 'bg-orange-100',
                                        n.type === 'expiry' && 'bg-red-100',
                                        n.type === 'new-prescription' && 'bg-blue-100'
                                    )}>
                                        {n.type === "low-stock" && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                                        {n.type === "expiry" && <Bell className="h-5 w-5 text-red-600" />}
                                        {n.type === "new-prescription" && <ClipboardType className="h-5 w-5 text-blue-600" />}
                                    </div>
                                    <div className="flex-1 grid gap-1">
                                        <p className={cn("font-medium", !n.isRead && "text-foreground")}>{n.message}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(n.date).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No notifications found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
