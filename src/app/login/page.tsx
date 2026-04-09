"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { user, fetchOrCreateUser } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/jobs');
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast.error('Firebase Auth is not configured.');
      return;
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Fetch or Create user securely on Firebase DB
      await fetchOrCreateUser(result.user.uid, result.user.displayName || 'New User');
      
      toast.success('Successfully logged in!');
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-6 rotate-12 shadow-lg shadow-indigo-600/30 flex items-center justify-center">
          <span className="text-white text-3xl font-black -rotate-12">R</span>
        </div>
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          RightNext
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
          Sign in to connect with your community
        </p>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:border-blue-500/50 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {loading ? 'Connecting...' : 'Continue with Google'}
      </button>
      
      <p className="text-center text-[10px] sm:text-xs text-zinc-400 mt-8">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
