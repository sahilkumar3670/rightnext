"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Settings, 
  Briefcase, 
  Trophy, 
  Calendar,
  LogOut,
  Camera
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const { user, jobs, offers, updateUserProfile, setUser, authLoading } = useStore();
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 font-bold text-[10px] uppercase tracking-widest animate-pulse">Syncing Profile</p>
      </div>
    );
  }

  if (!user) return null;



  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      setUser(null);
      toast.success("Signed out successfully");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  // Stats
  const postedCount = jobs.filter(j => j.creatorId === user.id).length;
  const offersCount = offers.filter(o => o.helperId === user.id).length;
  const completedCount = jobs.filter(j => j.creatorId === user.id && j.status === 'completed').length;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden"
      >
        {/* Banner with organic gradient */}
        <div className="h-32 sm:h-48 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent animate-pulse" />
        </div>

        <div className="px-6 sm:px-12 pb-12">
          {/* Avatar Area */}
          <div className="relative -mt-16 sm:-mt-24 mb-6 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-48 sm:h-48 bg-white dark:bg-zinc-950 p-2 sm:p-3 rounded-[2rem] sm:rounded-[3rem] shadow-2xl">
                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center text-zinc-400">
                  <UserIcon className="w-16 h-16 sm:w-24 sm:h-24 opacity-50" />
                </div>
              </div>
              <button className="absolute bottom-2 right-2 p-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4"
                >
                  <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {user.name}
                  </h1>
                </motion.div>
              </div>
              <p className="flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase tracking-widest mt-2 px-1">
                <MapPin className="w-4 h-4 text-zinc-400" /> {user.location}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
            {/* Stats Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-5 bg-zinc-50 dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm group hover:border-blue-500/20 transition-all">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{postedCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1.5">Jobs Requested</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-zinc-50 dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm group hover:border-blue-500/20 transition-all">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{offersCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1.5">Proposals Sent</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-900 dark:bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-500/10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Platform Rank</h4>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-black">Trusted Peer</p>
                  <Trophy className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Account Details & Management */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-white dark:bg-zinc-950/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Login Phone</p>
                  <div className="flex items-center gap-3 text-zinc-900 dark:text-white font-bold leading-none">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span>{user.phone}</span>
                  </div>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-950/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Rating Score</p>
                  <div className="flex items-center gap-3 text-zinc-900 dark:text-white font-black leading-none">
                    <div className="text-xl">⭐ {user.rating}</div>
                  </div>
                </div>
              </div>

              <div className="p-1 px-1 flex flex-col sm:flex-row gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button className="flex-1 py-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-100 transition shadow-sm">
                  <Settings className="w-4 h-4" /> Account Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 py-4 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition group shadow-sm"
                >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
