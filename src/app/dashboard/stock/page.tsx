"use client";

import { StockTable } from "@/components/dashboard/stock-table";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboard } from "@/context/dashboard-context";

export default function StockPage() {
    const { medicines, addMedicine } = useDashboard();
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Stock Management</h1>
            <Card>
                <CardContent className="pt-6">
                    <StockTable data={medicines} onAddMedicine={addMedicine} />
                </CardContent>
            </Card>
        </div>
    )
}
