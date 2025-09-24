
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search } from "lucide-react";
import type { Medicine } from "@/lib/types";
import { AddMedicineForm } from "./add-medicine-form";

type StockTableProps = {
    data: Medicine[];
    onAddMedicine: (medicine: Omit<Medicine, 'id'>) => void;
}

export function StockTable({ data, onAddMedicine }: StockTableProps) {
  const [filter, setFilter] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  const getStockStatus = (med: Medicine) => {
    if (med.quantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (med.quantity < med.lowStockThreshold) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    return <Badge variant="outline">In Stock</Badge>;
  };

  const filteredMedicines = data.filter(
    (med) =>
      med.name.toLowerCase().includes(filter.toLowerCase()) ||
      med.manufacturer.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4 gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by name or brand..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medicine</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new medicine to your inventory.
              </DialogDescription>
            </DialogHeader>
            <AddMedicineForm onAddMedicine={onAddMedicine} onFinished={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedicines.length ? (
              filteredMedicines.map((med) => (
                <TableRow key={med.id}>
                  <TableCell className="font-medium">{med.name}</TableCell>
                  <TableCell>{med.manufacturer}</TableCell>
                  <TableCell>{med.quantity}</TableCell>
                  <TableCell>{new Date(med.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>₹{med.price.toFixed(2)}</TableCell>
                  <TableCell>{getStockStatus(med)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
