export type Medicine = {
  id: string;
  name: string;
  brand: string;
  quantity: number;
  expiryDate: string;
  price: number;
  lowStockThreshold: number;
};

export type Prescription = {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  medicines: {
    medicineId: string;
    name: string;
    dosage: string;
  }[];
  status: "Pending" | "Ready for Pickup" | "Completed" | "Out of Stock";
};

export type Notification = {
  id: string;
  type: "low-stock" | "expiry" | "new-prescription";
  message: string;
  date: string;
  isRead: boolean;
};

export type SalesData = {
  medicineName: string;
  brand: string;
  quantitySold: number;
  date: string;
};

export type PrescriptionTrendData = {
  medicineName: string;
  doctorSpecialty: string;
  frequency: number;
  date: string;
};
