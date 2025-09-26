
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { medicines as initialMedicines } from '@/lib/data';
import type { Medicine } from '@/lib/types';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type Profile = {
  ownerName: string;
  pharmacyName: string;
  email: string;
  location?: string;
  timings?: string;
  isOpen: boolean;
}

type DashboardContextType = {
  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id' | 'brand'>) => void;
  profile: Profile | null;
  pharmacyStatus: boolean;
  isProfileLoading: boolean;
  fetchProfile: () => Promise<void>;
  setPharmacyStatus: (isOpen: boolean) => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pharmacyStatus, setPharmacyStatusState] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const addMedicine = (newMedicine: Omit<Medicine, 'id'>) => {
    const newMed: Medicine = {
      ...newMedicine,
      id: `med${medicines.length + 101}` // temporary unique id, avoid collision with initial data
    };
    setMedicines(prev => [newMed, ...prev]);
  };

  const fetchProfile = useCallback(async () => {
    if (auth?.currentUser && firestore) {
      setIsProfileLoading(true);
      try {
        const docRef = doc(firestore, "pharmacies", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Profile;
          setProfile(data);
          setPharmacyStatusState(data.isOpen);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    } else if (!auth?.currentUser) {
        setIsProfileLoading(false);
    }
  }, [auth, firestore]);

  useEffect(() => {
    if (auth?.currentUser) {
        fetchProfile();
    } else {
        // Handle case where user is not logged in or auth is not initialized
        const unsubscribe = auth?.onAuthStateChanged(user => {
            if (user) {
                fetchProfile();
            } else {
                setIsProfileLoading(false);
            }
        });
        return () => unsubscribe?.();
    }
  }, [auth, fetchProfile]);

  const setPharmacyStatus = async (isOpen: boolean) => {
    if (!auth?.currentUser || !firestore) {
      toast({ variant: "destructive", title: "Error", description: "Could not update status." });
      throw new Error("Firebase not initialized or user not logged in");
    }
    
    const docRef = doc(firestore, "pharmacies", auth.currentUser.uid);
    try {
      await setDoc(docRef, { isOpen }, { merge: true });
      setPharmacyStatusState(isOpen);
      if (profile) {
        setProfile({...profile, isOpen });
      }
    } catch (error) {
       console.error("Error updating status:", error);
       throw error;
    }
  };

  return (
    <DashboardContext.Provider value={{ medicines, addMedicine, profile, pharmacyStatus, isProfileLoading, fetchProfile, setPharmacyStatus }}>
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
