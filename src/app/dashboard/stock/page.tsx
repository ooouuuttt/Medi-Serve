import { medicines } from "@/lib/data";
import { StockTable } from "@/components/dashboard/stock-table";
import { Card, CardContent } from "@/components/ui/card";

export default function StockPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Stock Management</h1>
            <Card>
                <CardContent className="pt-6">
                    <StockTable data={medicines} />
                </CardContent>
            </Card>
        </div>
    )
}
