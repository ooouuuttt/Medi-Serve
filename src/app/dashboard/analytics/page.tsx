import { SalesChart } from "@/components/dashboard/sales-chart";
import { SalesTrendAnalyzer } from "@/components/dashboard/sales-trend-analyzer";
import { salesData, prescriptionTrendData } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function convertToCsv(data: any[]) {
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ];
    return csvRows.join('\n');
}

export default function AnalyticsPage() {
  const salesDataCsv = convertToCsv(salesData);
  const prescriptionTrendsCsv = convertToCsv(prescriptionTrendData);

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales</CardTitle>
          <CardDescription>Total quantity of medicines sold per month.</CardDescription>
        </CardHeader>
        <CardContent>
          <SalesChart />
        </CardContent>
      </Card>

      <SalesTrendAnalyzer
        salesDataCsv={salesDataCsv}
        prescriptionTrendsCsv={prescriptionTrendsCsv}
      />
    </div>
  );
}
