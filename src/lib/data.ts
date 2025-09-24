import type { Medicine, Prescription, Notification, SalesData, PrescriptionTrendData, Doctor, Appointment, PatientRecord } from './types';

export const medicines: Medicine[] = [
  { id: 'med1', name: 'Paracetamol', manufacturer: 'Calpol', description: 'Used for pain relief and to reduce fever.', requiresPrescription: false, quantity: 150, expiryDate: '2025-12-31', price: 5.00, lowStockThreshold: 50 },
  { id: 'med2', name: 'Ibuprofen', manufacturer: 'Advil', description: 'Reduces inflammation and treats pain.', requiresPrescription: false, quantity: 45, expiryDate: '2024-11-30', price: 8.50, lowStockThreshold: 50 },
  { id: 'med3', name: 'Amoxicillin', manufacturer: 'Generic', description: 'Antibiotic used to treat bacterial infections.', requiresPrescription: true, quantity: 200, expiryDate: '2025-08-01', price: 12.75, lowStockThreshold: 75 },
  { id: 'med4', name: 'Lisinopril', manufacturer: 'Zestril', description: 'Treats high blood pressure and heart failure.', requiresPrescription: true, quantity: 70, expiryDate: '2026-01-15', price: 22.00, lowStockThreshold: 50 },
  { id: 'med5', name: 'Metformin', manufacturer: 'Glucophage', description: 'Used to treat type 2 diabetes.', requiresPrescription: true, quantity: 10, expiryDate: '2024-09-20', price: 15.20, lowStockThreshold: 20 },
  { id: 'med6', name: 'Amlodipine', manufacturer: 'Norvasc', description: 'Treats high blood pressure and chest pain (angina).', requiresPrescription: true, quantity: 90, expiryDate: '2025-06-30', price: 18.00, lowStockThreshold: 40 },
  { id: 'med7', name: 'Cetirizine', manufacturer: 'Zyrtec', description: 'Antihistamine for allergy relief.', requiresPrescription: false, quantity: 120, expiryDate: '2025-10-10', price: 7.80, lowStockThreshold: 60 },
];

export const prescriptions: Prescription[] = [
  {
    id: 'pres1',
    patientName: 'Alice Johnson',
    doctorName: 'Dr. Smith',
    date: '2024-07-20',
    medicines: [
        { medicineId: 'med1', name: 'Paracetamol', dosage: '500mg, twice a day', quantity: 10 },
        { medicineId: 'med7', name: 'Cetirizine', dosage: '10mg, once a day', quantity: 5 }
    ],
    status: 'Pending',
  },
  {
    id: 'pres2',
    patientName: 'Bob Williams',
    doctorName: 'Dr. Jones',
    date: '2024-07-19',
    medicines: [{ medicineId: 'med3', name: 'Amoxicillin', dosage: '250mg, three times a day', quantity: 15 }],
    status: 'Ready for Pickup',
  },
  {
    id: 'pres3',
    patientName: 'Charlie Brown',
    doctorName: 'Dr. Davis',
    date: '2024-07-18',
    medicines: [{ medicineId: 'med5', name: 'Metformin', dosage: '500mg, twice daily', quantity: 30 }],
    status: 'Completed',
  },
  {
    id: 'pres4',
    patientName: 'Diana Prince',
    doctorName: 'Dr. Miller',
    date: '2024-07-21',
    medicines: [{ medicineId: 'med99', name: 'Ozempic', dosage: '1mg/week', quantity: 1 }],
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
    {"medicineName": "Paracetamol", "manufacturer": "Calpol", "quantitySold": 120, "date": "2024-01-15"},
    {"medicineName": "Ibuprofen", "manufacturer": "Advil", "quantitySold": 80, "date": "2024-01-20"},
    {"medicineName": "Amoxicillin", "manufacturer": "Generic", "quantitySold": 50, "date": "2024-02-10"},
    {"medicineName": "Cetirizine", "manufacturer": "Zyrtec", "quantitySold": 200, "date": "2024-03-05"},
    {"medicineName": "Paracetamol", "manufacturer": "Calpol", "quantitySold": 150, "date": "2024-04-12"},
    {"medicineName": "Lisinopril", "manufacturer": "Zestril", "quantitySold": 60, "date": "2024-05-18"},
    {"medicineName": "Ibuprofen", "manufacturer": "Advil", "quantitySold": 90, "date": "2024-06-25"},
];

export const prescriptionTrendData: PrescriptionTrendData[] = [
    {"medicineName": "Paracetamol", "doctorSpecialty": "General Physician", "frequency": 300, "date": "2024-01-01"},
    {"medicineName": "Ibuprofen", "doctorSpecialty": "Orthopedic", "frequency": 150, "date": "2024-01-01"},
    {"medicineName": "Amoxicillin", "doctorSpecialty": "Pediatrician", "frequency": 120, "date": "2024-02-01"},
    {"medicineName": "Cetirizine", "doctorSpecialty": "Allergist", "frequency": 250, "date": "2024-03-01"},
    {"medicineName": "Lisinopril", "doctorSpecialty": "Cardiologist", "frequency": 180, "date": "2024-05-01"},
];

// The following data is kept for type-checking but is not displayed in the UI to maintain privacy.
export const doctors: Doctor[] = [
    { id: 'doc1', name: 'Dr. Evelyn Reed', specialty: 'Cardiologist', bio: 'Expert in heart-related conditions with over 15 years of experience.' },
    { id: 'doc2', name: 'Dr. Marcus Chen', specialty: 'Pediatrician', bio: 'Dedicated to providing the best care for children of all ages.' },
    { id: 'doc3', name: 'Dr. Sofia Rossi', specialty: 'Dermatologist', bio: 'Specializing in skin health and cosmetic dermatology.' }
];

export const appointments: Appointment[] = [
    { id: 'apt1', patientName: 'Alice Johnson', doctorName: 'Evelyn Reed', date: '2024-08-05T10:00:00Z', status: 'Confirmed' },
    { id: 'apt2', patientName: 'Bob Williams', doctorName: 'Marcus Chen', date: '2024-08-05T14:30:00Z', status: 'Confirmed' },
    { id: 'apt3', patientName: 'Charlie Brown', doctorName: 'Sofia Rossi', date: '2024-08-06T11:00:00Z', status: 'Pending' }
];

export const patientRecords: PatientRecord[] = [
    {
        patientId: 'pat1',
        patientName: 'Alice Johnson',
        age: 34,
        bloodType: 'O+',
        allergies: ['Peanuts', 'Penicillin'],
        vitals: [
            { type: 'Blood Pressure', value: '120/80 mmHg' },
            { type: 'Heart Rate', value: '72 bpm' },
            { type: 'Temperature', value: '98.6°F' }
        ],
        prescriptions: [
            { medicine: 'Lisinopril', dosage: '10mg', doctor: 'Dr. Evelyn Reed', date: '2024-06-15' },
            { medicine: 'Amlodipine', dosage: '5mg', doctor: 'Dr. Evelyn Reed', date: '2024-06-15' },
        ],
        documents: [
            { name: 'Annual Checkup Report', type: 'pdf', date: '2024-01-20' },
            { name: 'X-Ray Scan', type: 'jpg', date: '2023-11-05' }
        ]
    }
];
