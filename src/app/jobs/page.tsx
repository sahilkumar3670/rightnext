"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Search, MapPin, IndianRupee, Clock, ShieldCheck, CheckCircle2, Star, Calendar, Navigation, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '@/components/ConfirmModal';

const LOCAL_RADIUS_KM = 50; // Strict limit for "local" jobs

export default function BrowseJobs() {
  const { jobs, user, reviews, addOffer, deleteJob } = useStore();
  const router = useRouter();

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isLocalOnly, setIsLocalOnly] = useState(true);
  const [jobToCancel, setJobToCancel] = useState<string | null>(null);

  const handleCancelPost = async () => {
    if (!jobToCancel) return;
    try {
      await deleteJob(jobToCancel);
      toast.success('Post cancelled successfully');
    } catch {
      toast.error('Failed to cancel post');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.warn("Location access denied. Showing all jobs.");
          setIsLocalOnly(false);
        }
      );
    }
  }, []);

  const getUserRating = (userId: string) => {
    const userReviews = reviews.filter(r => r.toUserId === userId);
    if (userReviews.length === 0) return null;
    const avg = userReviews.reduce((acc, curr) => acc + curr.rating, 0) / userReviews.length;
    return { avg: avg.toFixed(1), count: userReviews.length };
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  const formatTime = (time: number | string) => {
    if (!time) return 'New';
    const ms = typeof time === 'string' ? new Date(time).getTime() : time;
    if (isNaN(ms)) return 'New';
    
    const diff = Math.max(0, Date.now() - ms);
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'New';
    return `${hours}h ago`;
  };

  const handleSendOffer = async (e: React.FormEvent, jobId: string) => {
    e.preventDefault();
    if (!user) {
      toast.error('Log in required');
      router.push('/login');
      return;
    }
    if (!offerPrice) return toast.error('Enter a price');

    const message = offerMessage || "Hi, I'm interested in this task and ready to help.";

    try {
      await addOffer({
        jobId,
        helperId: user.id,
        helperName: user.name,
        helperPhone: user.phone,
        helperVerified: user.isVerified || false,
        message: message,
        price: Number(offerPrice),
        status: 'pending',
      });
      toast.success('Offer sent!');
      router.push('/history');
    } catch {
      toast.error('Failed to submit');
    }
  };

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          j.description.toLowerCase().includes(searchQuery.toLowerCase());
    const isOpen = j.status === 'open';
    
    let isNearby = true;
    if (isLocalOnly && userCoords && j.coordinates) {
      const dist = getDistance(userCoords.lat, userCoords.lng, j.coordinates.lat, j.coordinates.lng);
      isNearby = dist <= LOCAL_RADIUS_KM;
    }

    return isOpen && matchesSearch && isNearby;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
             <h1 className="text-base font-bold text-zinc-900 dark:text-white leading-none">Find Tasks</h1>
             {userCoords && (
               <button 
                 onClick={() => setIsLocalOnly(!isLocalOnly)}
                 className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                   isLocalOnly 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                 }`}
               >
                 {isLocalOnly ? <Navigation className="w-2.5 h-2.5 fill-white" /> : <Globe className="w-2.5 h-2.5" />}
                 {isLocalOnly ? 'Near Me (50km)' : 'Global'}
               </button>
             )}
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-[8px] mt-1 font-bold uppercase tracking-widest">
            {filteredJobs.length} matches found
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search tasks or skills..."
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 pl-9 pr-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div layout className="flex flex-col gap-2">
        <AnimatePresence mode='popLayout'>
          {filteredJobs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800"
            >
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-5 h-5 text-zinc-400" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No tasks nearby</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Try 'Global Search' or widen your search.</p>
              {userCoords && isLocalOnly && (
                <button 
                  onClick={() => setIsLocalOnly(false)}
                  className="mt-3 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-widest"
                >
                  Show Global Tasks
                </button>
              )}
            </motion.div>
          ) : (
            filteredJobs.map((job) => {
              const distance = userCoords && job.coordinates 
                ? getDistance(userCoords.lat, userCoords.lng, job.coordinates.lat, job.coordinates.lng)
                : null;

              return (
                <motion.div 
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-xl border transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:hover:shadow-[0_4px_20px_rgb(0,0,0,0.2)] ${
                    selectedJobId === job.id ? 'border-blue-500 ring-1 ring-blue-500/10' : 'border-zinc-200/60 dark:border-zinc-800'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-700" />

                  <div className="relative p-3 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight truncate">
                                {job.title}
                              </h3>
                              {distance !== null && distance <= 5 && (
                                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[7px] font-black px-1 py-0.5 rounded uppercase">Super Near</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-medium text-zinc-400 dark:text-zinc-500">
                              <span className="truncate max-w-[90px]">By {job.creatorName}</span>
                              <span className="w-0.5 h-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                              <span>{formatTime(job.createdAt)}</span>
                              {distance !== null && (
                                <>
                                  <span className="w-0.5 h-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                  <span className="text-blue-600 dark:text-blue-400 font-bold">{distance} km</span>
                                </>
                              )}
                            </div>
                          </div>

                          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-snug font-medium line-clamp-1">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-2">
                            {job.scheduledDate && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50/50 dark:bg-blue-500/5 rounded-lg border border-blue-100/50 dark:border-blue-500/10 shrink-0">
                                <Calendar className="w-2.5 h-2.5 text-blue-500" />
                                <span className="text-[10px] sm:text-[11px] font-black text-blue-700 dark:text-blue-400">{job.scheduledDate}</span>
                              </div>
                            )}
                            {(() => {
                              const rating = getUserRating(job.creatorId);
                              return rating && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50/50 dark:bg-amber-500/5 rounded-lg border border-amber-100/50 dark:border-amber-500/10">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  <span className="text-[10px] sm:text-[11px] font-black text-amber-700 dark:text-amber-500">{rating.avg}</span>
                                </div>
                              );
                            })()}
                            
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                              <MapPin className="w-2.5 h-2.5 text-zinc-400" />
                              <a 
                                href={job.coordinates ? `https://www.google.com/maps?q=${job.coordinates.lat},${job.coordinates.lng}` : `https://www.google.com/maps/search/${encodeURIComponent(job.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] sm:text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-blue-600 transition-colors truncate max-w-[100px]"
                              >
                                {job.location}
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="lg:hidden shrink-0 flex flex-col items-end gap-1 self-center">
                          <div className="text-right space-y-0.5">
                            <div className="text-base font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                              ₹{job.budget}
                            </div>
                            <div className="text-[7px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1 bg-zinc-50 dark:bg-zinc-800 rounded">FIXED</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:block w-px h-10 bg-zinc-200 dark:bg-zinc-800" />

                    <div className="lg:w-40 shrink-0">
                      <div className="flex flex-col gap-2">
                        <div className="hidden lg:flex flex-col items-end space-y-0.5">
                          <div className="text-base font-black text-zinc-900 dark:text-white tracking-tight">₹{job.budget}</div>
                          <div className="text-[7px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Fixed Budget</div>
                        </div>

                        {user?.id === job.creatorId ? (
                          <div className="w-full flex flex-col gap-2">
                            <div className="w-full flex items-center justify-center gap-1 py-1.5 text-[8px] font-black text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 uppercase tracking-widest">
                              OWN POST
                            </div>
                            <button 
                              onClick={() => setJobToCancel(job.id)}
                              className="w-full py-1.5 text-[8px] font-black text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors uppercase tracking-[0.2em]"
                            >
                              Cancel Post
                            </button>
                          </div>
                        ) : (
                          <AnimatePresence mode='wait'>
                            {selectedJobId === job.id ? (
                              <motion.form 
                                key="form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onSubmit={(e) => handleSendOffer(e, job.id)}
                                className="space-y-2 bg-zinc-50 dark:bg-zinc-950 p-2 sm:p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 shrink-0"
                              >
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <IndianRupee className="w-3 h-3 absolute left-2.5 top-2.5 text-zinc-400" />
                                    <input
                                      type="number"
                                      required
                                      className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-bold outline-none focus:ring-1 focus:ring-blue-500/30"
                                      placeholder="Price"
                                      value={offerPrice}
                                      onChange={(e) => setOfferPrice(e.target.value)}
                                    />
                                  </div>
                                  <button type="button" onClick={() => setSelectedJobId(null)} className="px-2 py-1.5 text-[9px] font-black text-zinc-400 uppercase">X</button>
                                </div>
                                <button type="submit" className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md shadow-blue-500/20">Submit</button>
                              </motion.form>
                            ) : (
                              <div className="space-y-2">
                                <motion.button
                                  key="btn"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  onClick={() => {
                                    if (!user) {
                                      toast.error('Login required to send offers');
                                      router.push('/login');
                                      return;
                                    }
                                    setSelectedJobId(job.id);
                                    setOfferPrice(job.budget.toString());
                                  }}
                                  className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.15em] hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                                >
                                  Send Offer
                                </motion.button>
                                <button 
                                  onClick={() => toast.success('Reported to RightNext team. We will review this shortly.')}
                                  className="w-full py-1.5 text-[7px] font-black text-zinc-400 group-hover:text-red-400 transition-colors uppercase tracking-[0.2em]"
                                >
                                  🚩 Report
                                </button>
                              </div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>

      <ConfirmModal 
        isOpen={!!jobToCancel}
        onClose={() => setJobToCancel(null)}
        onConfirm={handleCancelPost}
        title="Cancel Post"
        subtitle="Are you sure you want to cancel this post? It will no longer be visible to helpers."
        confirmText="Cancel Post"
      />
    </div>
  );
}
