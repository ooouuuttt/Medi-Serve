
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { medicines as initialMedicines } from '@/lib/data';
import type { Medicine } from '@/lib/types';

type DashboardContextType = {
  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id' | 'brand'>) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);

  const addMedicine = (newMedicine: Omit<Medicine, 'id'>) => {
    const newMed: Medicine = {
      ...newMedicine,
      id: `med${medicines.length + 101}` // temporary unique id, avoid collision with initial data
    };
    setMedicines(prev => [newMed, ...prev]);
  };

  return (
    <DashboardContext.Provider value={{ medicines, addMedicine }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
