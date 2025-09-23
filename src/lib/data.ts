import type { Medicine, Prescription, Notification, SalesData, PrescriptionTrendData } from './types';

export const medicines: Medicine[] = [
  { id: 'med1', name: 'Paracetamol', brand: 'Calpol', quantity: 150, expiryDate: '2025-12-31', price: 5.00, lowStockThreshold: 50 },
  { id: 'med2', name: 'Ibuprofen', brand: 'Advil', quantity: 45, expiryDate: '2024-11-30', price: 8.50, lowStockThreshold: 50 },
  { id: 'med3', name: 'Amoxicillin', brand: 'Generic', quantity: 200, expiryDate: '2025-08-01', price: 12.75, lowStockThreshold: 75 },
  { id: 'med4', name: 'Lisinopril', brand: 'Zestril', quantity: 70, expiryDate: '2026-01-15', price: 22.00, lowStockThreshold: 50 },
  { id: 'med5', name: 'Metformin', brand: 'Glucophage', quantity: 10, expiryDate: '2024-09-20', price: 15.20, lowStockThreshold: 20 },
  { id: 'med6', name: 'Amlodipine', brand: 'Norvasc', quantity: 90, expiryDate: '2025-06-30', price: 18.00, lowStockThreshold: 40 },
  { id: 'med7', name: 'Cetirizine', brand: 'Zyrtec', quantity: 120, expiryDate: '2025-10-10', price: 7.80, lowStockThreshold: 60 },
];

export const prescriptions: Prescription[] = [
  {
    id: 'pres1',
    patientName: 'Alice Johnson',
    doctorName: 'Dr. Smith',
    date: '2024-07-20',
    medicines: [{ medicineId: 'med1', name: 'Paracetamol', dosage: '500mg, twice a day' }, { medicineId: 'med7', name: 'Cetirizine', dosage: '10mg, once a day' }],
    status: 'Pending',
  },
  {
    id: 'pres2',
    patientName: 'Bob Williams',
    doctorName: 'Dr. Jones',
    date: '2024-07-19',
    medicines: [{ medicineId: 'med3', name: 'Amoxicillin', dosage: '250mg, three times a day' }],
    status: 'Ready for Pickup',
  },
  {
    id: 'pres3',
    patientName: 'Charlie Brown',
    doctorName: 'Dr. Davis',
    date: '2024-07-18',
    medicines: [{ medicineId: 'med5', name: 'Metformin', dosage: '500mg, twice daily' }],
    status: 'Completed',
  },
  {
    id: 'pres4',
    patientName: 'Diana Prince',
    doctorName: 'Dr. Miller',
    date: '2024-07-21',
    medicines: [{ medicineId: 'med99', name: 'Ozempic', dosage: '1mg/week' }],
    status: 'Pending',
  },
];

export const notifications: Notification[] = [
  { id: 'notif1', type: 'low-stock', message: 'Ibuprofen (Advil) is running low. Current stock: 45 units.', date: '2024-07-21', isRead: false },
  { id: 'notif2', type: 'expiry', message: 'Metformin (Glucophage) is expiring soon on 2024-09-20.', date: '2024-07-20', isRead: false },
  { id: 'notif3', type: 'new-prescription', message: 'New prescription received from Dr. Miller for Diana Prince.', date: '2024-07-21', isRead: false },
  { id: 'notif4', type: 'low-stock', message: 'Metformin (Glucophage) is out of stock.', date: '2024-07-18', isRead: true },
];

export const salesData: SalesData[] = [
    {"medicineName": "Paracetamol", "brand": "Calpol", "quantitySold": 120, "date": "2024-01-15"},
    {"medicineName": "Ibuprofen", "brand": "Advil", "quantitySold": 80, "date": "2024-01-20"},
    {"medicineName": "Amoxicillin", "brand": "Generic", "quantitySold": 50, "date": "2024-02-10"},
    {"medicineName": "Cetirizine", "brand": "Zyrtec", "quantitySold": 200, "date": "2024-03-05"},
    {"medicineName": "Paracetamol", "brand": "Calpol", "quantitySold": 150, "date": "2024-04-12"},
    {"medicineName": "Lisinopril", "brand": "Zestril", "quantitySold": 60, "date": "2024-05-18"},
    {"medicineName": "Ibuprofen", "brand": "Advil", "quantitySold": 90, "date": "2024-06-25"},
];

export const prescriptionTrendData: PrescriptionTrendData[] = [
    {"medicineName": "Paracetamol", "doctorSpecialty": "General Physician", "frequency": 300, "date": "2024-01-01"},
    {"medicineName": "Ibuprofen", "doctorSpecialty": "Orthopedic", "frequency": 150, "date": "2024-01-01"},
    {"medicineName": "Amoxicillin", "doctorSpecialty": "Pediatrician", "frequency": 120, "date": "2024-02-01"},
    {"medicineName": "Cetirizine", "doctorSpecialty": "Allergist", "frequency": 250, "date": "2024-03-01"},
    {"medicineName": "Lisinopril", "doctorSpecialty": "Cardiologist", "frequency": 180, "date": "2024-05-01"},
];
