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
    quantity: number;
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

// The following types are defined for data structure purposes but are not used to display
// sensitive patient or doctor information in the pharmacy's UI.

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  bio: string;
};

export type Appointment = {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  status: "Confirmed" | "Pending" | "Cancelled";
};

export type PatientRecord = {
  patientId: string;
  patientName: string;
  age: number;
  bloodType: string;
  allergies: string[];
  vitals: {
    type: string;
    value: string;
  }[];
  prescriptions: {
    medicine: string;
    dosage: string;
    doctor: string;
    date: string;
  }[];
  documents: {
    name: string;
    type: string;
    date: string;
  }[];
};
