import { create } from 'zustand';
import { User, Job, Offer, Review } from '@/lib/types';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';

interface StoreState {
  user: User | null;
  jobs: Job[];
  offers: Offer[];
  reviews: Review[];
  isFirebaseActive: boolean;
  authLoading: boolean;
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  addReview: (review: Omit<Review, 'id'>) => Promise<void>;
  // Actions that will sync with Firebase
  fetchOrCreateUser: (uid: string, defaultName: string) => Promise<User>;
  updateUserProfile: (uid: string, data: Partial<User>) => Promise<void>;
  addJob: (job: Omit<Job, 'id'>) => Promise<void>;
  addOffer: (offer: Omit<Offer, 'id'>) => Promise<void>;
  updateJob: (jobId: string, status: Job['status']) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  updateOffer: (offerId: string, status: Offer['status']) => Promise<void>;
  // Listener initializers
  initFirebaseListeners: () => () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  jobs: [],
  offers: [],
  reviews: [],
  isFirebaseActive: !!db,
  authLoading: true,

  setUser: (user) => set({ user }),
  setAuthLoading: (authLoading) => set({ authLoading }),

  addReview: async (review) => {
    if (!db) return;
    await addDoc(collection(db, 'reviews'), review);
  },

  fetchOrCreateUser: async (uid, defaultName) => {
    let userData: User;
    if (db) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        userData = userSnap.data() as User;
      } else {
        // Create new user in DB
        userData = {
          id: uid,
          name: defaultName,
          phone: '',
          location: 'Adding Soon',
          role: 'user',
          rating: 5.0,
          isVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as unknown as User;
        await setDoc(userRef, userData);
      }
    } else {
      userData = {
        id: uid,
        name: defaultName,
        phone: '',
        location: 'Mock City',
        role: 'user',
        rating: 5.0,
        isVerified: false,
      };
    }
    set({ user: userData });
    return userData;
  },

  updateUserProfile: async (uid, data) => {
    const updatePayload = { ...data, updatedAt: Date.now() };
    if (db) {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updatePayload);
    }
    set((state) => ({
      user: state.user && state.user.id === uid ? { ...state.user, ...updatePayload } : state.user
    }));
  },

  addJob: async (jobData) => {
    const timestamp = Date.now();
    const finalData = { ...jobData, createdAt: timestamp, updatedAt: timestamp };
    if (db) {
      await addDoc(collection(db, 'jobs'), finalData);
    } else {
      console.warn("Firebase not configured. Using local state.");
      const mockJob: Job = { ...finalData, id: Math.random().toString(36).substring(7) } as Job;
      set((state) => ({ jobs: [mockJob, ...state.jobs] }));
    }
  },

  addOffer: async (offerData) => {
    const timestamp = Date.now();
    const finalData = { ...offerData, createdAt: timestamp, updatedAt: timestamp };
    if (db) {
      await addDoc(collection(db, 'offers'), finalData);
    } else {
      console.warn("Firebase not configured. Using local state.");
      const mockOffer: Offer = { ...finalData, id: Math.random().toString(36).substring(7) } as Offer;
      set((state) => ({ offers: [mockOffer, ...state.offers] }));
    }
  },

  updateJob: async (jobId, status) => {
    const updatePayload: any = { status, updatedAt: Date.now() };
    if (status === 'cancelled') updatePayload.cancelledAt = Date.now();
    
    if (db) {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, updatePayload);
    } else {
      set((state) => ({
        jobs: state.jobs.map(j => j.id === jobId ? { ...j, ...updatePayload } : j)
      }));
    }
  },

  deleteJob: async (jobId) => {
    const updatePayload = { status: 'cancelled', updatedAt: Date.now(), cancelledAt: Date.now() };
    if (db) {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, updatePayload);
    } else {
      set((state) => ({
        jobs: state.jobs.map(j => (j.id === jobId ? { ...j, ...updatePayload } as Job : j))
      }));
    }
  },

  updateOffer: async (offerId, status) => {
    const updatePayload: any = { status, updatedAt: Date.now() };
    if (status === 'cancelled') updatePayload.cancelledAt = Date.now();
    
    if (db) {
      const offerRef = doc(db, 'offers', offerId);
      await updateDoc(offerRef, updatePayload);
    } else {
      set((state) => ({
        offers: state.offers.map(o => o.id === offerId ? { ...o, ...updatePayload } : o)
      }));
    }
  },

  initFirebaseListeners: () => {
    if (!db) {
      console.warn("Firebase config is missing - running purely on mock local state. Please fill your .env.local file.");
      return () => { }; // No-op
    }

    const jobsQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      set({ jobs: jobsList });
    });

    const offersQuery = query(collection(db, 'offers'));
    const unsubscribeOffers = onSnapshot(offersQuery, (snapshot) => {
      const offersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Offer[];
      set({ offers: offersList });
    });

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      set({ reviews });
    });

    return () => {
      unsubscribeJobs();
      unsubscribeOffers();
      unsubReviews();
    };
  }
}));
