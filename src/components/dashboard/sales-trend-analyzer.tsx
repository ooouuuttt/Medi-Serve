
"use client";

import { useState } from "react";
import { analyzeSalesTrends } from "@/ai/flows/sales-trend-analyzer";
import type { AnalyzeSalesTrendsOutput } from "@/ai/flows/sales-trend-analyzer";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";

interface SalesTrendAnalyzerProps {
  salesDataCsv: string;
  prescriptionTrendsCsv: string;
}

export function SalesTrendAnalyzer({ salesDataCsv, prescriptionTrendsCsv }: SalesTrendAnalyzerProps) {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSalesTrendsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeSalesTrends({
        salesData: salesDataCsv,
        prescriptionTrends: prescriptionTrendsCsv,
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze trends. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = () => {
    if (!analysisResult) return;
    const { highestDemandMedicines, futureStockPredictions, stockOptimizationSuggestions } = analysisResult;
    let reportContent = "Sales Trend Analysis Report\n\n";
    reportContent += "--- Highest Demand Medicines ---\n";
    highestDemandMedicines.forEach(med => {
        reportContent += `${med.name}: ${med.quantity} units - ${med.reason}\n`;
    })
    reportContent += "\n--- Future Stock Predictions ---\n";
    futureStockPredictions.forEach(pred => {
        reportContent += `${pred.name}: ${pred.total} units\n`;
    })
    reportContent += "\n--- Stock Optimization Suggestions ---\n";
    reportContent += `${stockOptimizationSuggestions}\n\n`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sales_analysis_report.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Sales Trend Analyzer</CardTitle>
        <CardDescription>
          Use AI to analyze sales and prescription data to identify high-demand medicines and predict future needs. The text areas below are pre-filled with sample data.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="salesData" className="text-sm font-medium">Sales Data (CSV)</label>
          <Textarea id="salesData" defaultValue={salesDataCsv} rows={8} className="mt-2 font-mono text-xs" />
        </div>
        <div>
          <label htmlFor="prescriptionTrends" className="text-sm font-medium">Prescription Trends (CSV)</label>
          <Textarea id="prescriptionTrends" defaultValue={prescriptionTrendsCsv} rows={8} className="mt-2 font-mono text-xs" />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalyze} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Analyze Trends
        </Button>
      </CardFooter>

      {analysisResult && (
        <>
          <Separator />
          <CardContent className="pt-6">
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Highest Demand Medicines</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                       <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analysisResult.highestDemandMedicines}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                    }}
                                    cursor={{fill: 'hsl(var(--muted))'}}
                                />
                                <Bar dataKey="quantity" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Future Stock Predictions</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analysisResult.futureStockPredictions}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                    }}
                                    cursor={{fill: 'hsl(var(--muted))'}}
                                />
                                <Line type="monotone" dataKey="total" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-2))", r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Stock Optimization Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{analysisResult.stockOptimizationSuggestions}</p>
                    </CardContent>
                </Card>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
