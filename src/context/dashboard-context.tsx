
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Medicine } from '@/lib/types';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, collection, addDoc, getDocs } from 'firebase/firestore';
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
  addMedicine: (medicine: Omit<Medicine, 'id'>) => Promise<void>;
  profile: Profile | null;
  pharmacyStatus: boolean;
  isProfileLoading: boolean;
  fetchProfile: () => Promise<void>;
  setPharmacyStatus: (isOpen: boolean) => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pharmacyStatus, setPharmacyStatusState] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const fetchStock = useCallback(async () => {
    if (auth?.currentUser && firestore) {
      try {
        const stockCollectionRef = collection(firestore, "pharmacies", auth.currentUser.uid, "stock");
        const querySnapshot = await getDocs(stockCollectionRef);
        const stockList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
        setMedicines(stockList);
      } catch (error) {
        console.error("Error fetching stock:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch stock data." });
      }
    }
  }, [auth, firestore, toast]);

  const addMedicine = async (newMedicine: Omit<Medicine, 'id'>) => {
    if (!auth?.currentUser || !firestore) {
        throw new Error("User not logged in or Firebase not initialized.");
    }
    const stockCollectionRef = collection(firestore, "pharmacies", auth.currentUser.uid, "stock");
    await addDoc(stockCollectionRef, newMedicine);
    await fetchStock(); // Refresh stock list
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
        await fetchStock(); // Fetch stock after profile
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    } else if (!auth?.currentUser) {
        setIsProfileLoading(false);
    }
  }, [auth, firestore, fetchStock]);

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
                setMedicines([]); // Clear medicines on logout
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
