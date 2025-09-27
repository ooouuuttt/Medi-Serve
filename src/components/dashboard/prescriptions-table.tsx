
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Bot, Send } from "lucide-react";
import type { Prescription } from "@/lib/types";
import { PatientUpdateTool } from "./patient-update-tool";
import { useDashboard } from "@/context/dashboard-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth, useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

type MedicineStatus = "packaged" | "out-of-stock" | "unavailable";

export function PrescriptionsTable({ data }: { data: Prescription[] }) {
  const { medicines: stock, addNotification, prescriptions, setPrescriptions } = useDashboard();
  const [selectedPrescription, setSelectedPrescription] = React.useState<Prescription | null>(null);
  const [isAiUpdateOpen, setIsAiUpdateOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [medicineStatuses, setMedicineStatuses] = React.useState<Record<string, MedicineStatus>>({});
  const auth = useAuth();
  const firestore = useFirestore();

  const handleStatusChange = async (id: string, status: Prescription["status"]) => {
    if (!auth?.currentUser || !firestore) return;

    const presDocRef = doc(firestore, "pharmacies", auth.currentUser.uid, "MediPrescription", id);
    await updateDoc(presDocRef, { status });

    const updatedPrescriptions = prescriptions.map((p) => {
        if (p.id === id) {
          if (p.status === 'Pending' && status === 'Ready for Pickup') {
            addNotification({
              type: 'new-prescription',
              message: `Prescription for ${p.patientName} is now ready for pickup.`,
            });
          }
          return { ...p, status };
        }
        return p;
      });
      setPrescriptions(updatedPrescriptions);
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

  const handleRowClick = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    const initialStatuses: Record<string, MedicineStatus> = {};
    prescription.medicines.forEach(med => {
        const stockItem = stock.find(s => s.id === med.medicineId);
        if (stockItem && stockItem.quantity >= med.quantity) {
            initialStatuses[med.medicineId] = "packaged";
        } else {
            initialStatuses[med.medicineId] = "out-of-stock";
        }
    });
    setMedicineStatuses(initialStatuses);
    setIsDetailOpen(true);
  };

  const handleMedicineStatusChange = (medicineId: string, status: MedicineStatus) => {
    setMedicineStatuses(prev => ({ ...prev, [medicineId]: status }));
  };

  const getPriceForMedicine = (medicineId: string) => {
      const medicine = stock.find(m => m.id === medicineId);
      return medicine ? medicine.price : 0;
  }

  const calculateTotal = () => {
    if (!selectedPrescription) return 0;
    return selectedPrescription.medicines.reduce((total, med) => {
        if (medicineStatuses[med.medicineId] === "packaged") {
            return total + (getPriceForMedicine(med.medicineId) * med.quantity);
        }
        return total;
    }, 0);
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
                <TableRow key={p.id} onClick={() => handleRowClick(p)} className="cursor-pointer">
                  <TableCell className="font-medium">{p.patientName}</TableCell>
                  <TableCell>{p.doctorName}</TableCell>
                  <TableCell>{formatDate(p.date)}</TableCell>
                  <TableCell>{getStatusBadge(p.status)}</TableCell>
                  <TableCell>{p.medicines.map(m => m.name).join(', ')}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Dialog open={isAiUpdateOpen && selectedPrescription?.id === p.id} onOpenChange={setIsAiUpdateOpen}>
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
                             <DropdownMenuItem onSelect={() => setSelectedPrescription(p)}>
                                <Bot className="mr-2 h-4 w-4" />
                                Send AI Update
                             </DropdownMenuItem>
                           </DialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                       {selectedPrescription && (
                        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                            <DialogTitle>Generate Patient Update</DialogTitle>
                            <DialogDescription>
                                Use AI to craft a friendly notification for {selectedPrescription.patientName}.
                            </DialogDescription>
                            </DialogHeader>
                            <PatientUpdateTool prescription={selectedPrescription} />
                        </DialogContent>
                       )}
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
      {selectedPrescription && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Prescription Details for {selectedPrescription.patientName}</DialogTitle>
                    <DialogDescription>
                        Doctor: {selectedPrescription.doctorName} | Date: {formatDate(selectedPrescription.date)}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Medicine</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedPrescription.medicines.map(med => (
                                <TableRow key={med.medicineId}>
                                    <TableCell>
                                        <div className="font-medium">{med.name}</div>
                                        <div className="text-sm text-muted-foreground">{med.dosage}</div>
                                    </TableCell>
                                    <TableCell>{med.quantity}</TableCell>
                                    <TableCell>₹{getPriceForMedicine(med.medicineId).toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <RadioGroup 
                                            value={medicineStatuses[med.medicineId]}
                                            onValueChange={(value) => handleMedicineStatusChange(med.medicineId, value as MedicineStatus)}
                                            className="flex justify-end gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="packaged" id={`${med.medicineId}-packaged`} />
                                                <Label htmlFor={`${med.medicineId}-packaged`}>Packaged</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="out-of-stock" id={`${med.medicineId}-out-of-stock`} />
                                                <Label htmlFor={`${med.medicineId}-out-of-stock`}>Out of Stock</Label>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="unavailable" id={`${med.medicineId}-unavailable`} />
                                                <Label htmlFor={`${med.medicineId}-unavailable`}>Unavailable</Label>
                                            </div>
                                        </RadioGroup>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter className="mt-4 border-t pt-4 sm:justify-between items-center">
                   <div className="text-lg font-bold">Total Bill: ₹{calculateTotal().toFixed(2)}</div>
                    <Button>
                        <Send className="mr-2 h-4 w-4" /> Send Bill to Patient
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
