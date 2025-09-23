import { prescriptions } from "@/lib/data";
import { PrescriptionsTable } from "@/components/dashboard/prescriptions-table";
import { Card, CardContent } from "@/components/ui/card";

export default function PrescriptionsPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Prescription Handling</h1>
            <Card>
                <CardContent className="pt-6">
                    <PrescriptionsTable data={prescriptions} />
                </CardContent>
            </Card>
        </div>
    )
}
