"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { UserCircle2, ArrowRight, Phone } from "lucide-react";
import toast from "react-hot-toast";

export default function NameModal() {
  const { user, updateUserProfile } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && (!user.phone || user.name === 'New User' || user.name === 'Mock User' || !user.name)) {
       setIsOpen(true);
       setName(user.name !== 'New User' && user.name !== 'Mock User' ? user.name : "");
       setPhone(user.phone || "");
    } else {
       setIsOpen(false);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Please enter a valid name");
      return;
    }
    if (phone.trim().length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile(user.id, { 
        name: name.trim(),
        phone: phone.trim() 
      });
      toast.success("Welcome aboard, " + name.trim() + "!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 p-8 transform transition-all scale-100">
        
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-indigo-500/30 shadow-xl">
            <UserCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
            Complete your profile
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
            Tell us who you are and how neighbors can contact you.
          </p>

          <form onSubmit={handleUpdate} className="w-full space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserCircle2 className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full font-medium text-base pl-12 pr-4 py-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-zinc-900 dark:text-white"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type="tel"
                placeholder="Phone Number (10 digits)"
                maxLength={10}
                className="w-full font-medium text-base pl-12 pr-4 py-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-zinc-900 dark:text-white"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <button
              type="submit"
              disabled={loading || name.trim().length < 2 || phone.length < 10}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 mt-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Continue"} <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
