
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import type { Order } from "@/lib/types";
import { useDashboard } from "@/context/dashboard-context";
import { useAuth, useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

export function OrdersTable({ data }: { data: Order[] }) {
  const { addNotification } = useDashboard();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleStatusChange = async (id: string, status: Order["status"]) => {
    if (!auth?.currentUser || !firestore) return;

    const orderDocRef = doc(firestore, "orders", id);
    await updateDoc(orderDocRef, { status });

    // Note: The context will update the state via the onSnapshot listener.
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Processing":
        return <Badge variant="default">Processing</Badge>;
      case "Ready for Pickup":
        return <Badge className="bg-blue-500 text-white">Ready for Pickup</Badge>;
      case "Completed":
        return <Badge variant="outline">Completed</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatDate = (timestamp: Order['createdAt']) => {
    if (!timestamp) return "No date";
    let date;
    if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else if (timestamp && typeof timestamp.seconds === 'number') {
        date = new Date(timestamp.seconds * 1000);
    } else {
        return "Invalid Date";
    }

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.customerName}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</TableCell>
                  <TableCell>₹{order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Processing")}>
                          Mark as Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Ready for Pickup")}>
                          Mark as Ready for Pickup
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Completed")}>
                          Mark as Completed
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleStatusChange(order.id, "Cancelled")}>
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

    