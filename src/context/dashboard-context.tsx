
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

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => {
    if (!auth?.currentUser || !firestore) return;

    // Prevent duplicate notifications by checking local state first
    if (notifications.some(n => n.message === notification.message)) {
      return;
    }

    const newNotificationData = {
      ...notification,
      date: new Date().toISOString(),
      isRead: false,
    };

    try {
        const notificationsCollectionRef = collection(firestore, "pharmacies", auth.currentUser.uid, "MediNotify");
        const docRef = await addDoc(notificationsCollectionRef, newNotificationData);
        
        const newNotification = { ...newNotificationData, id: docRef.id };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadNotifications(prev => prev + 1);
    } catch(error) {
        console.error("Error adding notification:", error);
    }
  }, [auth, firestore, notifications]);

  const checkExpiryAndLowStock = useCallback((stock: Medicine[]) => {
    const notificationPromises: Promise<void>[] = [];
    stock.forEach(med => {
      const daysUntilExpiry = differenceInDays(new Date(med.expiryDate), new Date());
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        notificationPromises.push(addNotification({
          type: 'expiry',
          message: `${med.name} is expiring in ${daysUntilExpiry} days.`
        }));
      } else if (daysUntilExpiry <= 0) {
         notificationPromises.push(addNotification({
          type: 'expiry',
          message: `${med.name} has expired.`
        }));
      }

      if (med.quantity === 0) {
         notificationPromises.push(addNotification({
          type: 'low-stock',
          message: `${med.name} is out of stock.`
        }));
      } else if (med.quantity < med.lowStockThreshold) {
        notificationPromises.push(addNotification({
          type: 'low-stock',
          message: `${med.name} is running low on stock (${med.quantity} remaining).`
        }));
      }
    });
    return Promise.all(notificationPromises);
  }, [addNotification]);

  const fetchStock = useCallback(async (uid: string) => {
    if (firestore) {
      try {
        const stockCollectionRef = collection(firestore, "pharmacies", uid, "stock");
        const querySnapshot = await getDocs(stockCollectionRef);
        const stockList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
        setMedicines(stockList);
        return stockList;
      } catch (error) {
        console.error("Error fetching stock:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch stock data." });
        return [];
      }
    }
    return [];
  }, [firestore, toast]);
  
  const fetchNotifications = useCallback(async (uid: string) => {
    if (firestore) {
      setIsNotificationsLoading(true);
      try {
        const notificationsCollectionRef = collection(firestore, "pharmacies", uid, "MediNotify");
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
  }, [firestore]);

  const fetchPrescriptions = useCallback(async (uid: string) => {
    if (firestore) {
      try {
        const presCollectionRef = collection(firestore, "pharmacies", uid, "MediPrescription");
        const querySnapshot = await getDocs(presCollectionRef);
        const presList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
        setPrescriptions(presList);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      }
    }
  }, [firestore]);

  const createSampleData = useCallback(async (uid: string) => {
      if (!firestore) return;
      
      const notificationsCollectionRef = collection(firestore, "pharmacies", uid, "MediNotify");
      const notificationsSnapshot = await getDocs(notificationsCollectionRef);
      if (notificationsSnapshot.empty) {
           await addDoc(notificationsCollectionRef, {
              type: "new-prescription",
              message: "Welcome! This is a sample notification.",
              date: new Date().toISOString(),
              isRead: false,
          });
      }

      const presCollectionRef = collection(firestore, "pharmacies", uid, "MediPrescription");
      const presSnapshot = await getDocs(presCollectionRef);
      if (presSnapshot.empty) {
          await addDoc(presCollectionRef, {
              patientName: "John Doe",
              doctorName: "Dr. Smith",
              date: new Date().toISOString(),
              medicines: [
                  { medicineId: 'med1', name: 'Paracetamol', dosage: '500mg, as needed', quantity: 20 }
              ],
              status: "Pending"
          });
      }
  }, [firestore]);


  const fetchProfile = useCallback(async () => {
    if (auth?.currentUser && firestore) {
      setIsProfileLoading(true);
      const uid = auth.currentUser.uid;
      try {
        const docRef = doc(firestore, "pharmacies", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Profile;
          setProfile(data);
          setPharmacyStatusState(data.isOpen);
        }

        await createSampleData(uid);
        const stockData = await fetchStock(uid);
        await fetchNotifications(uid);
        await fetchPrescriptions(uid);
        // This must run after notifications are fetched to avoid duplicate welcome messages.
        await checkExpiryAndLowStock(stockData); 

      } catch (error) {
        console.error("Error fetching profile and related data:", error);
      } finally {
        setIsProfileLoading(false);
      }
    } else if (!auth?.currentUser) {
        setIsProfileLoading(false);
    }
  }, [auth, firestore, createSampleData, fetchStock, fetchNotifications, fetchPrescriptions, checkExpiryAndLowStock]);


  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged(user => {
      if (user) {
        fetchProfile();
      } else {
        setIsProfileLoading(false);
        setMedicines([]);
        setNotifications([]);
        setUnreadNotifications(0);
        setPrescriptions([]);
        setProfile(null);
      }
    });
    return () => unsubscribe?.();
  }, [auth, fetchProfile]);


  const addMedicine = async (newMedicine: Omit<Medicine, 'id'>) => {
    if (!auth?.currentUser || !firestore) {
        throw new Error("User not logged in or Firebase not initialized.");
    }
    const stockCollectionRef = collection(firestore, "pharmacies", auth.currentUser.uid, "stock");
    const docRef = await addDoc(stockCollectionRef, newMedicine);
    
    setMedicines(prev => [...prev, {id: docRef.id, ...newMedicine}]);

    await addNotification({
      type: 'new-prescription', // Using this type as a general 'item added'
      message: `New medicine added: ${newMedicine.name}.`
    });

    if (newMedicine.quantity < newMedicine.lowStockThreshold) {
      await addNotification({
        type: 'low-stock',
        message: `${newMedicine.name} is low on stock (${newMedicine.quantity} added).`
      });
    }
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
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
        setUnreadNotifications(0);
        toast({ title: "Success", description: "All notifications marked as read." });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not mark notifications as read." });
    }
  };


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
