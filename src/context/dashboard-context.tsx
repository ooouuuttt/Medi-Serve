
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Medicine, Notification, Prescription } from '@/lib/types';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays } from 'date-fns';


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
  notifications: Notification[];
  unreadNotifications: number;
  isNotificationsLoading: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  profile: Profile | null;
  pharmacyStatus: boolean;
  isProfileLoading: boolean;
  fetchProfile: () => Promise<void>;
  setPharmacyStatus: (isOpen: boolean) => Promise<void>;
  prescriptions: Prescription[];
  setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pharmacyStatus, setPharmacyStatusState] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    if (auth?.currentUser && firestore) {
      setIsNotificationsLoading(true);
      try {
        const notificationsCollectionRef = collection(firestore, "pharmacies", auth.currentUser.uid, "MediNotify");
        const q = query(notificationsCollectionRef);
        const querySnapshot = await getDocs(q);
        const notificationsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        notificationsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotifications(notificationsList);
        setUnreadNotifications(notificationsList.filter(n => !n.isRead).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsNotificationsLoading(false);
      }
    }
  }, [auth, firestore]);

  const addNotification = async (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => {
    if (!auth?.currentUser || !firestore) return;

    // Prevent duplicate notifications
    const q = query(collection(firestore, "pharmacies", auth.currentUser.uid, "MediNotify"), where("message", "==", notification.message));
    const existingNotifications = await getDocs(q);
    if (!existingNotifications.empty) {
        // console.log("Duplicate notification suppressed:", notification.message);
        return; // Don't add if a notification with the exact same message already exists
    }
    
    const notificationsCollectionRef = collection(firestore, "pharmacies", auth.currentUser.uid, "MediNotify");
    await addDoc(notificationsCollectionRef, {
      ...notification,
      date: new Date().toISOString(),
      isRead: false,
    });
    await fetchNotifications(); // Refetch notifications after adding a new one
  };

  const markAllAsRead = async () => {
    if (!auth?.currentUser || !firestore) return;

    const notificationsToUpdate = notifications.filter(n => !n.isRead);
    if(notificationsToUpdate.length === 0) return;

    const batch = writeBatch(firestore);
    notificationsToUpdate.forEach(notification => {
        const docRef = doc(firestore, "pharmacies", auth.currentUser!.uid, "MediNotify", notification.id);
        batch.update(docRef, { isRead: true });
    });

    try {
        await batch.commit();
        await fetchNotifications();
        toast({ title: "Success", description: "All notifications marked as read." });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not mark notifications as read." });
    }
  };

  const checkExpiryAndLowStock = useCallback(async (stock: Medicine[]) => {
    stock.forEach(med => {
      // Check for expiry
      const daysUntilExpiry = differenceInDays(new Date(med.expiryDate), new Date());
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        addNotification({
          type: 'expiry',
          message: `${med.name} is expiring in ${daysUntilExpiry} days.`
        });
      } else if (daysUntilExpiry <= 0) {
         addNotification({
          type: 'expiry',
          message: `${med.name} has expired.`
        });
      }

      // Check for low stock
       if (med.quantity === 0) {
         addNotification({
          type: 'low-stock',
          message: `${med.name} is out of stock.`
        });
      } else if (med.quantity < med.lowStockThreshold) {
        addNotification({
          type: 'low-stock',
          message: `${med.name} is running low on stock (${med.quantity} remaining).`
        });
      }
    });
  }, [addNotification]);

  const fetchStock = useCallback(async () => {
    if (auth?.currentUser && firestore) {
      try {
        const stockCollectionRef = collection(firestore, "pharmacies", auth.currentUser.uid, "stock");
        const querySnapshot = await getDocs(stockCollectionRef);
        const stockList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
        setMedicines(stockList);
        await checkExpiryAndLowStock(stockList); // Check stock on fetch
      } catch (error) {
        console.error("Error fetching stock:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch stock data." });
      }
    }
  }, [auth, firestore, toast, checkExpiryAndLowStock]);

    const fetchPrescriptions = useCallback(async () => {
    if (auth?.currentUser && firestore) {
      try {
        const presCollectionRef = collection(firestore, "pharmacies", auth.currentUser.uid, "MediPrescription");
        const querySnapshot = await getDocs(presCollectionRef);
        const presList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
        setPrescriptions(presList);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      }
    }
  }, [auth, firestore]);

  const addMedicine = async (newMedicine: Omit<Medicine, 'id'>) => {
    if (!auth?.currentUser || !firestore) {
        throw new Error("User not logged in or Firebase not initialized.");
    }
    const stockCollectionRef = collection(firestore, "pharmacies", auth.currentUser.uid, "stock");
    await addDoc(stockCollectionRef, newMedicine);
    
    // Add notification for new medicine
    await addNotification({
      type: 'new-prescription', // Using this type as a general 'item added'
      message: `New medicine added: ${newMedicine.name}.`
    });

    // Add notification if stock is low
    if (newMedicine.quantity < newMedicine.lowStockThreshold) {
      await addNotification({
        type: 'low-stock',
        message: `${newMedicine.name} is low on stock (${newMedicine.quantity} added).`
      });
    }

    await fetchStock(); // Refresh stock list
  };

   const createSampleNotification = useCallback(async (uid: string) => {
    if (firestore) {
        const notificationsCollectionRef = collection(firestore, "pharmacies", uid, "MediNotify");
        const querySnapshot = await getDocs(notificationsCollectionRef);
        if (querySnapshot.empty) {
             await addDoc(notificationsCollectionRef, {
                type: "new-prescription",
                message: "Welcome! This is a sample notification.",
                date: new Date().toISOString(),
                isRead: false,
            });
            await fetchNotifications();
        }
    }
  }, [firestore, fetchNotifications]);

  const createSamplePrescription = useCallback(async (uid: string) => {
    if (firestore) {
        const presCollectionRef = collection(firestore, "pharmacies", uid, "MediPrescription");
        const querySnapshot = await getDocs(presCollectionRef);
        if (querySnapshot.empty) {
            await addDoc(presCollectionRef, {
                patientName: "John Doe",
                doctorName: "Dr. Smith",
                date: new Date().toISOString(),
                medicines: [
                    { medicineId: 'med1', name: 'Paracetamol', dosage: '500mg, as needed', quantity: 20 }
                ],
                status: "Pending"
            });
            await fetchPrescriptions();
        }
    }
  }, [firestore, fetchPrescriptions]);


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
        await fetchStock();
        await fetchNotifications();
        await fetchPrescriptions();
        await createSampleNotification(auth.currentUser.uid);
        await createSamplePrescription(auth.currentUser.uid);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    } else if (!auth?.currentUser) {
        setIsProfileLoading(false);
    }
  }, [auth, firestore, fetchStock, fetchNotifications, fetchPrescriptions, createSampleNotification, createSamplePrescription]);

  useEffect(() => {
    if (auth?.currentUser) {
        fetchProfile();
    } else {
        const unsubscribe = auth?.onAuthStateChanged(user => {
            if (user) {
                fetchProfile();
            } else {
                setIsProfileLoading(false);
                setMedicines([]);
                setNotifications([]);
                setUnreadNotifications(0);
                setPrescriptions([]);
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
    <DashboardContext.Provider value={{ 
      medicines, 
      addMedicine, 
      profile, 
      pharmacyStatus, 
      isProfileLoading, 
      fetchProfile, 
      setPharmacyStatus, 
      notifications,
      unreadNotifications,
      isNotificationsLoading,
      addNotification,
      markAllAsRead,
      prescriptions,
      setPrescriptions
    }}>
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
