"use client";

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { MessageSquarePlus, X, Send, Sparkles, Star, Bug, Heart, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function FloatingFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useStore();
  
  const [form, setForm] = useState({
    message: '',
    type: 'suggestion',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.message.trim().length < 5) {
      toast.error('Please provide a clearer suggestion.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.name || 'Visitor',
          email: user?.phone || 'Not Logged In',
          feedback: form.message,
          type: form.type
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      toast.success('Your feedback has been sent directly to the team! ✨');
      setForm({ message: '', type: 'suggestion' });
      setIsOpen(false);
    } catch (err) {
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[90vw] max-w-sm bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-zinc-900 dark:bg-blue-600 p-6 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 -m-4 opacity-10">
                <Sparkles className="w-24 h-24 rotate-12" />
              </div>
              <div className="relative">
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2 uppercase text-[12px]">
                  <Sparkles className="w-4 h-4 text-blue-400 dark:text-white" /> Give us suggestions
                </h3>
                <p className="opacity-70 text-[10px] font-bold uppercase tracking-widest mt-1">Help us make RightNext better</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                {[
                  { id: 'suggestion', icon: Star, label: 'Idea' },
                  { id: 'bug', icon: Bug, label: 'Issue' },
                  { id: 'love', icon: Heart, label: 'Love' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, type: t.id })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                      form.type === t.id 
                        ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm ring-1 ring-zinc-200/50' 
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    <t.icon className="w-3.5 h-3.5" /> {t.label}
                  </button>
                ))}
              </div>

              <textarea
                required
                disabled={loading}
                className="w-full min-h-[120px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="What can we improve? Your ideas go directly to our lead developer..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-zinc-900 dark:bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send directly</>}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isOpen 
            ? 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rotate-180' 
            : 'bg-zinc-900 dark:bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-zinc-900 dark:text-white" />
        ) : (
          <MessageSquarePlus className="w-7 h-7 sm:w-8 sm:h-8" />
        )}
      </motion.button>
    </div>
  );
}
