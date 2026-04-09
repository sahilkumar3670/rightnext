"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function Login() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { user, setUser, fetchOrCreateUser } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/jobs');
      return;
    }

    // Initialize reCAPTCHA when component mounts - handle React 18 strict mode remounts cleanly
    if (auth) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }

    // Cleanup on unmount to prevent recaptcha tracking errors
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [user, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (!auth) {
      toast.error('Firebase Auth is not configured. Ask the developer to check .env.local');
      return;
    }

    setLoading(true);
    try {
      const phoneNumber = `+91${phone.trim()}`;
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier as any);
      setConfirmationResult(result);
      toast.success('OTP sent successfully!');
      setStep(2);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to send OTP. Try again.');
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId: any) => {
          (window as any).grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      toast.error('Please enter a valid OTP.');
      return;
    }
    
    if (!confirmationResult) {
      toast.error('No OTP request found. Please go back and try again.');
      return;
    }

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      
      // Fetch or Create user securely on Firebase DB
      await fetchOrCreateUser(result.user.uid, result.user.phoneNumber || `+91${phone}`);
      
      toast.success('Successfully logged in!');
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Welcome to RightNext
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {step === 1 ? 'Enter your phone number to sign in' : 'Verify your phone number'}
        </p>
      </div>

      <div id="recaptcha-container"></div>

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Phone Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-zinc-500 sm:text-sm font-semibold">+91</span>
              </div>
              <input
                type="tel"
                name="phone"
                id="phone"
                disabled={loading}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 py-3 sm:text-sm border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Enter OTP
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="otp"
                id="otp"
                disabled={loading}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full py-3 px-4 sm:text-lg text-center tracking-widest border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify and Login'}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors disabled:opacity-50"
          >
            Wrong number? Go back
          </button>
        </form>
      )}
    </div>
  );
}
