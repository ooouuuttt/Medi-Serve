
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Medicine, Notification, Prescription, Order } from '@/lib/types';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, writeBatch, query, onSnapshot, Timestamp, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays } from 'date-fns';

type Profile = {
  ownerName: string;
  pharmacyName: string;
  email: string;
  location?: string;
  timings?: string;
  contactNumber?: string;
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
  orders: Order[];
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
  const [orders, setOrders] = useState<Order[]>([]);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => {
    if (!auth?.currentUser || !firestore) return;
    
    try {
        const notificationsCollectionRef = collection(firestore, "pharmacies", auth.currentUser.uid, "MediNotify");
        
        const newNotificationData = {
          ...notification,
          date: new Date().toISOString(),
          isRead: false,
        };

        const docRef = await addDoc(notificationsCollectionRef, newNotificationData);
        
        setNotifications(prev => {
          const newNotification = { ...newNotificationData, id: docRef.id };
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
    if (!auth?.currentUser || !firestore) return;

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
        notificationMessages.add(expiryMessage);
      }

      let stockMessage = '';
      if (med.quantity === 0) {
        stockMessage = `${med.name} is out of stock.`;
      } else if (med.quantity < med.lowStockThreshold) {
        stockMessage = `${med.name} is running low on stock (${med.quantity} remaining).`;
      }

      if (stockMessage && !notificationMessages.has(stockMessage)) {
        addNotification({ type: 'low-stock', message: stockMessage });
        notificationMessages.add(stockMessage);
      }
    });
  }, [auth, firestore, addNotification]);
  
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
        
        const stockCollectionRef = collection(firestore, "pharmacies", uid, "stock");
        const stockSnapshot = await getDocs(stockCollectionRef);
        const stockList = stockSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
        setMedicines(stockList);

        const notificationsCollectionRef = collection(firestore, "pharmacies", uid, "MediNotify");
        const notificationsSnapshot = await getDocs(query(notificationsCollectionRef));
        let notificationsList = notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));

        notificationsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotifications(notificationsList);
        setUnreadNotifications(notificationsList.filter(n => !n.isRead).length);

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
    if (!auth || !firestore) return;
  
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        fetchAllData(user.uid);
  
        const presCollectionRef = collection(firestore, "pharmacies", user.uid, "MediPrescription");
        const unsubscribePrescriptions = onSnapshot(presCollectionRef, (querySnapshot) => {
          const currentPrescriptions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
  
          querySnapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const newPrescription = { id: change.doc.id, ...change.doc.data() } as Prescription;
              if (!prescriptions.some(p => p.id === newPrescription.id)) {
                addNotification({
                  type: 'new-prescription',
                  message: `New prescription received from ${newPrescription.patientName}.`
                });
              }
            }
          });
          setPrescriptions(currentPrescriptions);
        });

        const ordersQuery = query(collection(firestore, "orders"), where("pharmacyId", "==", user.uid));
        const unsubscribeOrders = onSnapshot(ordersQuery, (querySnapshot) => {
            const ordersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            ordersList.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
            setOrders(ordersList);

            querySnapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                const newOrder = { id: change.doc.id, ...change.doc.data() } as Order;
                  addNotification({
                    type: 'new-order',
                    message: `New order received from ${newOrder.customerName}.`
                  });
              }
            });
        });
  
        const notifCollectionRef = collection(firestore, "pharmacies", user.uid, "MediNotify");
        const unsubscribeNotifications = onSnapshot(notifCollectionRef, (querySnapshot) => {
          const notificationsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
          setNotifications(notificationsList);
          setUnreadNotifications(notificationsList.filter(n => !n.isRead).length);
        });
  
        return () => {
          unsubscribePrescriptions();
          unsubscribeOrders();
          unsubscribeNotifications();
        };
      } else {
        // User is signed out
        setIsProfileLoading(false);
        setMedicines([]);
        setNotifications([]);
        setUnreadNotifications(0);
        setPrescriptions([]);
        setOrders([]);
        setProfile(null);
      }
    });
  
    return () => unsubscribeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, firestore, addNotification]);


  const addMedicine = async (newMedicine: Omit<Medicine, 'id'>) => {
    if (!auth?.currentUser || !firestore) {
        throw new Error("User not logged in or Firebase not initialized.");
    }
    const stockCollectionRef = collection(firestore, "pharmacies", auth.currentUser.uid, "stock");
    const docRef = await addDoc(stockCollectionRef, newMedicine);
    
    setMedicines(prev => [...prev, {id: docRef.id, ...newMedicine}]);

    await addNotification({
      type: 'new-prescription', 
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
      setPrescriptions,
      orders,
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
