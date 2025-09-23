import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appointments } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AppointmentsPage() {
    const upcomingAppointments = appointments.filter(a => new Date(a.date) >= new Date());

    return (
        <div className="grid gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Book Appointment
                </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                            <CardDescription>Here are your scheduled teleconsultations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingAppointments.length > 0 ? (
                                    upcomingAppointments.map(apt => (
                                        <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                            <div className="grid gap-1">
                                                <p className="font-medium">Dr. {apt.doctorName}</p>
                                                <p className="text-sm text-muted-foreground">{new Date(apt.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</p>
                                                <p className="text-sm text-muted-foreground">Patient: {apt.patientName}</p>
                                            </div>
                                            <Badge variant={apt.status === "Confirmed" ? "default" : "secondary"}>{apt.status}</Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">No upcoming appointments.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                         <CardHeader>
                            <CardTitle>Schedule</CardTitle>
                            <CardDescription>View your schedule at a glance.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={new Date()}
                                className="rounded-md border"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
