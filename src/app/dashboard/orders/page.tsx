
"use client";

import { OrdersTable } from "@/components/dashboard/orders-table";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboard } from "@/context/dashboard-context";


export default function OrdersPage() {
    const { orders } = useDashboard();
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Order Fulfillment</h1>
            <Card>
                <CardContent className="pt-6">
                    <OrdersTable data={orders} />
                </CardContent>
            </Card>
        </div>
    )
}

    