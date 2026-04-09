"use client";

import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, setUser, authLoading } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tighter">
              RightNext
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/jobs" className="text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-blue-600 transition-colors">
              Find Work
            </Link>

            {/* Auth Dependent Section */}
            <div className="flex items-center space-x-6">
              {authLoading ? (
                <div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-full" />
              ) : user ? (
                <>
                  <Link href="/history" className="text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-blue-600 transition-colors">
                    History
                  </Link>
                  <Link href="/post-job" className="px-5 py-2 rounded-xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                    Request Help
                  </Link>
                  <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
                  <div className="flex items-center space-x-4">
                    <Link href="/profile" className="flex items-center space-x-2.5 text-zinc-900 dark:text-zinc-100 group">
                      <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                        <UserIcon className="w-4 h-4 text-zinc-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <span className="font-bold text-sm tracking-tight">{user.name.split(' ')[0]}</span>
                    </Link>
                    <button 
                      onClick={logout} 
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <Link href="/login" className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                  Login
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 shadow-xl">
          <Link 
            href="/jobs" 
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-xl"
          >
            Find Work
          </Link>
          
          {authLoading ? (
            <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
          ) : user ? (
            <>
              <Link 
                href="/history" 
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-xl"
              >
                History
              </Link>
              <Link 
                href="/post-job" 
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-sm font-black text-blue-600 bg-blue-50 dark:bg-blue-900/10 rounded-xl uppercase tracking-widest"
              >
                Request Help
              </Link>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />
              <Link 
                href="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 rounded-xl"
              >
                <UserIcon className="w-4 h-4" /> Profile
              </Link>
              <button 
                onClick={() => { logout(); setIsOpen(false); }} 
                className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              onClick={() => setIsOpen(false)}
              className="block w-full py-3 text-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
