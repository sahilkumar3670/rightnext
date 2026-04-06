"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  title: string;
  subtitle: string;
}

export default function ReviewModal({ isOpen, onClose, onSubmit, title, subtitle }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating, comment);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h2>
                  <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="transition-transform active:scale-95"
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hover || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-zinc-200 dark:text-zinc-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                    Your Experience
                  </label>
                  <textarea
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm min-h-[100px] resize-none"
                    placeholder="Share some details about how it went..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={rating === 0}
                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-600/20"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
