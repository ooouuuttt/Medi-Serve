
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight, Package, ClipboardType, Bell, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/dashboard-context";

export default function DashboardPage() {
  const { medicines, notifications, prescriptions } = useDashboard();

  const stockSummary = medicines.reduce((acc, med) => {
    if (med.quantity === 0) acc.outOfStock += 1;
    else if (med.quantity < med.lowStockThreshold) acc.lowStock += 1;
    // The `inStock` property is handled below to count unique items
    return acc;
  }, { lowStock: 0, outOfStock: 0 });

  // Create a Set of unique medicine identifiers (name + manufacturer + price) for items in stock
  const inStockUniques = new Set(
    medicines
      .filter(med => med.quantity > 0)
      .map(med => `${med.name}|${med.manufacturer}|${med.price}`)
  );

  const newPrescriptions = prescriptions.filter(p => p.status === 'Pending');
  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inStockUniques.size}</div>
            <p className="text-xs text-muted-foreground">Unique medicine types in stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockSummary.lowStock}</div>
            <p className="text-xs text-muted-foreground">Items below threshold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockSummary.outOfStock}</div>
            <p className="text-xs text-muted-foreground">Items completely out of stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Prescriptions</CardTitle>
            <ClipboardType className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newPrescriptions.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <CardTitle>New Prescriptions</CardTitle>
            <Button asChild size="sm" className="ml-auto gap-1" variant="outline">
              <Link href="/dashboard/prescriptions">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden sm:table-cell">Doctor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newPrescriptions.slice(0, 2).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.patientName}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{p.doctorName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center">
             <CardTitle>Notifications</CardTitle>
            <Button asChild size="sm" className="ml-auto gap-1" variant="outline">
              <Link href="/dashboard/notifications">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4">
            {unreadNotifications.length > 0 ? unreadNotifications.slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-start gap-4">
                <div className={cn("rounded-full p-2 mt-1", 
                    n.type === 'low-stock' && 'bg-orange-100',
                    n.type === 'expiry' && 'bg-red-100',
                    n.type === 'new-prescription' && 'bg-blue-100'
                )}>
                    {n.type === "low-stock" && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                    {n.type === "expiry" && <Bell className="h-5 w-5 text-red-600" />}
                    {n.type === "new-prescription" && <ClipboardType className="h-5 w-5 text-blue-600" />}
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium">{n.message}</p>
                  <p className="text-sm text-muted-foreground">{new Date(n.date).toLocaleDateString()}</p>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground text-center py-4">No new notifications.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
