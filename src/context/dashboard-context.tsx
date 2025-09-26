
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Medicine, Notification, Prescription } from '@/lib/types';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, writeBatch, query, onSnapshot } from 'firebase/firestore';
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

    // To prevent a flicker/re-render loop, we don't check local state here.
    // We assume that the calling function has already checked for duplicates if needed.
    const newNotificationData = {
      ...notification,
      date: new Date().toISOString(),
      isRead: false,
    };

    try {
        const notificationsCollectionRef = collection(firestore, "pharmacies", auth.currentUser.uid, "MediNotify");
        const docRef = await addDoc(notificationsCollectionRef, newNotificationData);
        
        setNotifications(prev => {
          const newNotification = { ...newNotificationData, id: docRef.id };
          // Avoid adding duplicates if a race condition occurs
          if (prev.some(n => n.id === newNotification.id)) return prev;
          const updatedNotifications = [newNotification, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setUnreadNotifications(updatedNotifications.filter(n => !n.isRead).length);
          return updatedNotifications;
        });

    } catch(error) {
        console.error("Error adding notification:", error);
    }
  }, [auth, firestore]);
  
  const checkExpiryAndLowStock = useCallback((stock: Medicine[], existingNotifications: Notification[]) => {
    const notificationMessages = new Set(existingNotifications.map(n => n.message));

    stock.forEach(med => {
      let expiryMessage = '';
      const daysUntilExpiry = differenceInDays(new Date(med.expiryDate), new Date());
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        expiryMessage = `${med.name} is expiring in ${daysUntilExpiry} days.`;
      } else if (daysUntilExpiry <= 0) {
        expiryMessage = `${med.name} has expired.`;
      }
      if (expiryMessage && !notificationMessages.has(expiryMessage)) {
        addNotification({ type: 'expiry', message: expiryMessage });
        notificationMessages.add(expiryMessage); // Prevent adding it again in this session
      }

      let stockMessage = '';
      if (med.quantity === 0) {
        stockMessage = `${med.name} is out of stock.`;
      } else if (med.quantity < med.lowStockThreshold) {
        stockMessage = `${med.name} is running low on stock (${med.quantity} remaining).`;
      }
      if (stockMessage && !notificationMessages.has(stockMessage)) {
        addNotification({ type: 'low-stock', message: stockMessage });
        notificationMessages.add(stockMessage); // Prevent adding it again in this session
      }
    });
  }, [addNotification]);
  
  const fetchAllData = useCallback(async (uid: string) => {
    if (!firestore) return;
    setIsProfileLoading(true);
    setIsNotificationsLoading(true);
    try {
        const docRef = doc(firestore, "pharmacies", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Profile;
          setProfile(data);
          setPharmacyStatusState(data.isOpen);
        }
        
        // Fetch stock
        const stockCollectionRef = collection(firestore, "pharmacies", uid, "stock");
        const stockSnapshot = await getDocs(stockCollectionRef);
        const stockList = stockSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
        setMedicines(stockList);

        // Fetch initial notifications
        const notificationsCollectionRef = collection(firestore, "pharmacies", uid, "MediNotify");
        const notificationsSnapshot = await getDocs(query(notificationsCollectionRef));
        let notificationsList = notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));

        notificationsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotifications(notificationsList);
        setUnreadNotifications(notificationsList.filter(n => !n.isRead).length);

        // Run checks after initial data is loaded
        checkExpiryAndLowStock(stockList, notificationsList);

    } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch dashboard data." });
    } finally {
        setIsProfileLoading(false);
        setIsNotificationsLoading(false);
    }
  }, [firestore, toast, checkExpiryAndLowStock]);


  const fetchProfile = useCallback(async () => {
    if (auth?.currentUser) {
        await fetchAllData(auth.currentUser.uid);
    }
  }, [auth, fetchAllData]);


  useEffect(() => {
    const unsubscribeAuth = auth?.onAuthStateChanged(user => {
      if (user) {
        fetchAllData(user.uid);

        // Setup real-time listener for prescriptions
        const presCollectionRef = collection(firestore!, "pharmacies", user.uid, "MediPrescription");
        const unsubscribePrescriptions = onSnapshot(presCollectionRef, (querySnapshot) => {
            const presList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
            
            querySnapshot.docChanges().forEach(async (change) => {
              if (change.type === "added") {
                const newPrescription = { id: change.doc.id, ...change.doc.data() } as Prescription;
                
                // Check if it's a genuinely new prescription not already in the local state
                if (!prescriptions.some(p => p.id === newPrescription.id)) {
                    await addNotification({
                        type: 'new-prescription',
                        message: `New prescription received from ${newPrescription.patientName}.`
                    });
                }
              }
            });

            setPrescriptions(presList);
        });

        return () => {
          unsubscribePrescriptions();
        }
      } else {
        setIsProfileLoading(false);
        setMedicines([]);
        setNotifications([]);
        setUnreadNotifications(0);
        setPrescriptions([]);
        setProfile(null);
      }
    });

    return () => unsubscribeAuth?.();
  }, [auth, firestore, addNotification, fetchAllData, prescriptions]);


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

    if (newMedicine.quantity === 0) {
      await addNotification({
        type: 'low-stock',
        message: `${newMedicine.name} is out of stock.`
      });
    } else if (newMedicine.quantity < newMedicine.lowStockThreshold) {
      await addNotification({
        type: 'low-stock',
        message: `${newMedicine.name} is running low on stock (${newMedicine.quantity} remaining).`
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
