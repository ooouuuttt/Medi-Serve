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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Bot } from "lucide-react";
import type { Prescription } from "@/lib/types";
import { PatientUpdateTool } from "./patient-update-tool";

export function PrescriptionsTable({ data }: { data: Prescription[] }) {
  const [prescriptions, setPrescriptions] = React.useState(data);
  const [selectedPrescription, setSelectedPrescription] = React.useState<Prescription | null>(null);

  const handleStatusChange = (id: string, status: Prescription["status"]) => {
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };
  
  const getStatusBadge = (status: Prescription["status"]) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Ready for Pickup":
        return <Badge variant="default">Ready for Pickup</Badge>;
      case "Completed":
        return <Badge variant="outline">Completed</Badge>;
      case "Out of Stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Medicines</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.length ? (
              prescriptions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.patientName}</TableCell>
                  <TableCell>{p.doctorName}</TableCell>
                  <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(p.status)}</TableCell>
                  <TableCell>{p.medicines.map(m => m.name).join(', ')}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={selectedPrescription?.id === p.id} onOpenChange={(isOpen) => !isOpen && setSelectedPrescription(null)}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(p.id, "Ready for Pickup")}>
                            Mark as Ready
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(p.id, "Completed")}>
                            Mark as Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(p.id, "Out of Stock")}>
                            Mark Out of Stock
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <DialogTrigger asChild>
                             <DropdownMenuItem onClick={() => setSelectedPrescription(p)}>
                                <Bot className="mr-2 h-4 w-4" />
                                Send AI Update
                             </DropdownMenuItem>
                           </DialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Generate Patient Update</DialogTitle>
                          <DialogDescription>
                            Use AI to craft a friendly notification for {p.patientName}.
                          </DialogDescription>
                        </DialogHeader>
                        <PatientUpdateTool prescription={p} />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No prescriptions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
