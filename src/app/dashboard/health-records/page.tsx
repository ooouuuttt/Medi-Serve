import { patientRecords } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, HeartPulse, Stethoscope, Pill } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function HealthRecordsPage() {
    const record = patientRecords[0]; // Displaying the first patient's record as an example

    return (
        <div className="grid gap-6">
             <h1 className="text-3xl font-bold tracking-tight">Patient Health Records</h1>
             <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{record.patientName}</CardTitle>
                    <CardDescription>Age: {record.age} | Blood Type: {record.bloodType}</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex-row items-center gap-4 space-y-0">
                                <HeartPulse className="h-8 w-8 text-primary" />
                                <CardTitle>Vitals</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {record.vitals.map(vital => (
                                     <div key={vital.type} className="flex justify-between">
                                        <span className="text-muted-foreground">{vital.type}</span>
                                        <span className="font-medium">{vital.value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex-row items-center gap-4 space-y-0">
                                <Pill className="h-8 w-8 text-primary" />
                                <CardTitle>Prescriptions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                {record.prescriptions.map((p, i) => (
                                   <div key={i}>
                                       <div className="font-medium">{p.medicine} ({p.dosage})</div>
                                       <div className="text-muted-foreground">Dr. {p.doctor} - {p.date}</div>
                                   </div>
                                ))}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex-row items-center gap-4 space-y-0">
                                <FileText className="h-8 w-8 text-primary" />
                                <CardTitle>Documents</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {record.documents.map((doc, i) => (
                                   <div key={i} className="flex justify-between items-center">
                                       <div>
                                            <div className="font-medium">{doc.name}</div>
                                            <div className="text-muted-foreground">{doc.date}</div>
                                       </div>
                                       <a href="#" className="text-primary hover:underline">View</a>
                                   </div>
                                ))}
                            </CardContent>
                        </Card>
                     </div>
                      <Separator className="my-6" />
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center"><Stethoscope className="mr-2 h-5 w-5" />Allergies</h3>
                        <div className="flex flex-wrap gap-2">
                            {record.allergies.map(allergy => (
                                <span key={allergy} className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-full">{allergy}</span>
                            ))}
                        </div>
                      </div>
                </CardContent>
             </Card>
        </div>
    )
}
