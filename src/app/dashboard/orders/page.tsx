"use client";

import { OrdersTable } from "@/components/dashboard/orders-table";
import { Card, CardContent } from "@/components/ui/card";
import { orders as dummyOrders } from "@/lib/dummy-data";


export default function OrdersPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Order Fulfillment</h1>
            <Card>
                <CardContent className="pt-6">
                    <OrdersTable data={dummyOrders} />
                </CardContent>
            </Card>
        </div>
    )
}
