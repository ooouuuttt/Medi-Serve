import { notifications } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, AlertTriangle, ClipboardText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
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
                        {notifications.map(n => (
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
                                    {n.type === "new-prescription" && <ClipboardText className="h-5 w-5 text-blue-600" />}
                                </div>
                                <div className="flex-1 grid gap-1">
                                    <p className={cn("font-medium", !n.isRead && "text-foreground")}>{n.message}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(n.date).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
