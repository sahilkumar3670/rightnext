"use client";

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function FirebaseInit() {
  const { initFirebaseListeners, fetchOrCreateUser, setUser, setAuthLoading } = useStore();

  useEffect(() => {
    if (!auth) return;

    // Listen for Auth changes to persist session
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Re-fetch user profile from Firestore
        await fetchOrCreateUser(firebaseUser.uid, firebaseUser.phoneNumber || "");
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    // Start listening to Firestore Collections when app mounts
    const unsubscribeFirestore = initFirebaseListeners();

    // Stop listening when app unmounts
    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, [initFirebaseListeners, fetchOrCreateUser, setUser]);

  return null;
}
