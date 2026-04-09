"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChevronRight, 
  IndianRupee, 
  Phone, 
  MapPin, 
  Star,
  Search,
  Filter,
  ArrowUpRight
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ReviewModal from "@/components/ReviewModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function HistoryPage() {
  const { user, jobs, offers, reviews, updateJob, updateOffer, addReview, deleteJob, authLoading } = useStore();
  const [activeTab, setActiveTab] = useState<'my-jobs' | 'my-offers'>('my-jobs');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{jobId: string, toUserId: string, title: string, subtitle: string} | null>(null);
  const [jobToCancel, setJobToCancel] = useState<string | null>(null);

  const handleCancelPost = async () => {
    if (!jobToCancel) return;
    try {
      await deleteJob(jobToCancel);
      toast.success("Post cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  };

  useEffect(() => {
    setIsRefreshing(true);
    const timer = setTimeout(() => setIsRefreshing(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  if (authLoading) return <div className="p-20 text-center animate-pulse text-[10px] uppercase font-black tracking-widest text-zinc-400">Syncing History</div>;
  if (!user) return null;

  const myPostedJobs = jobs.filter(j => j.creatorId === user.id);
  const mySentOffers = offers.filter(o => o.helperId === user.id);
  const getJobForOffer = (jobId: string) => jobs.find(j => j.id === jobId);
  const getOffersForJob = (jobId: string) => offers.filter(o => o.jobId === jobId);

  const handleAcceptOffer = async (offerId: string, jobId: string) => {
    try {
      await updateOffer(offerId, 'accepted');
      const otherOffers = offers.filter(o => o.jobId === jobId && o.id !== offerId);
      for (const o of otherOffers) await updateOffer(o.id, 'rejected');
      await updateJob(jobId, 'assigned');
      toast.success("Hired!");
    } catch {
      toast.error("Error.");
    }
  };

  const handleCompleteJob = async (jobId: string, helperId: string, helperName: string) => {
    try {
      await updateJob(jobId, 'completed');
      toast.success("Done!");
      setReviewTarget({
        jobId,
        toUserId: helperId,
        title: `Rate ${helperName}`,
        subtitle: "How was the task?"
      });
    } catch {
      toast.error("Failed.");
    }
  };

  const isReviewed = (jobId: string, fromId: string, toId: string) => 
    reviews.some(r => r.jobId === jobId && r.fromUserId === fromId && r.toUserId === toId);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <ReviewModal 
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSubmit={async (rating, comment) => {
          if (!user || !reviewTarget) return;
          await addReview({
            jobId: reviewTarget.jobId,
            fromUserId: user.id,
            toUserId: reviewTarget.toUserId,
            rating,
            comment,
            createdAt: Date.now()
          });
          toast.success("Sent!");
        }}
        title={reviewTarget?.title || ""}
        subtitle={reviewTarget?.subtitle || ""}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-6">
        <div>
          <h1 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-[0.3em] mb-1">Activity</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your postings and offers</p>
        </div>
        
        <div className="flex bg-zinc-100/80 dark:bg-zinc-800/80 p-1.5 rounded-2xl w-full sm:w-auto shadow-inner border border-zinc-200/50 dark:border-zinc-700/50">
          <button
            onClick={() => setActiveTab('my-jobs')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === 'my-jobs' 
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-md transform scale-[1.02]' 
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            My Jobs ({myPostedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('my-offers')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === 'my-offers' 
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-md transform scale-[1.02]' 
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            My Offers ({mySentOffers.length})
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isRefreshing ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 sm:h-32 bg-zinc-100/80 dark:bg-zinc-800/50 animate-pulse rounded-3xl" />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-5 sm:space-y-6"
          >
            {(activeTab === 'my-jobs' ? myPostedJobs : mySentOffers).length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 mx-auto">
                <div className="w-12 h-12 mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-zinc-400" />
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest">No history yet</p>
              </div>
            ) : (
              activeTab === 'my-jobs' ? (
                myPostedJobs.map(job => {
                  const jobOffers = getOffersForJob(job.id);
                  const hiredHelper = jobOffers.find(o => o.status === 'accepted');
                  return (
                    <motion.div 
                      whileHover={{ y: -1 }}
                      key={job.id} 
                      className="bg-white dark:bg-zinc-900/90 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-blue-500/30 dark:hover:border-blue-400/30 transition-all duration-300 group"
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start pb-1">
                        <div className="w-full sm:flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5">
                            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-2">{job.title}</h3>
                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex-shrink-0 shadow-sm ${
                              job.status === 'open' ? 'bg-blue-50 text-blue-700 border border-blue-200/50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' : 
                              job.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200/50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50' : 
                              'bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50'
                            }`}>
                              {job.status}
                            </span>
                          </div>
                          
                          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 leading-relaxed">{job.description}</p>
                          
                          <div className="flex items-center gap-1.5 w-fit px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-700/50 transition-colors">
                            <MapPin className="w-3 h-3 text-blue-500" />
                            <a 
                              href={job.coordinates ? `https://www.google.com/maps?q=${job.coordinates.lat},${job.coordinates.lng}` : `https://www.google.com/maps/search/${encodeURIComponent(job.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] sm:text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[200px] sm:max-w-xs"
                            >
                              {job.location}
                            </a>
                          </div>
                        </div>

                        <div className="flex flex-row items-center justify-end w-full sm:w-auto gap-2 shrink-0 pt-3 sm:pt-0 mt-2 sm:mt-0 border-t sm:border-transparent border-zinc-100 dark:border-zinc-800/80">
                          {job.status === 'assigned' && hiredHelper && (
                            <button 
                              onClick={() => handleCompleteJob(job.id, hiredHelper.helperId, hiredHelper.helperName)}
                              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all"
                            >
                              Mark Done
                            </button>
                          )}
                          {job.status === 'open' && (
                            <button 
                              onClick={() => setJobToCancel(job.id)}
                              className="flex-1 sm:flex-none px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-red-200/50 dark:border-red-500/20"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {jobOffers.length > 0 && (
                        <>
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent my-4" />

                          <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                Proposals ({jobOffers.length})
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {jobOffers.map(offer => (
                                <div key={offer.id} className="flex flex-col p-3.5 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 hover:border-blue-400/30 dark:hover:border-blue-400/30 transition-all group/offer">
                                  <div className="flex items-start justify-between mb-2 gap-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/50">
                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{offer.helperName.charAt(0)}</span>
                                      </div>
                                      <div>
                                        <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white block leading-tight">{offer.helperName}</span>
                                        {offer.status === 'accepted' && <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-0.5 block">Hired</span>}
                                      </div>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm shrink-0">
                                      <span className="text-xs font-black text-zinc-900 dark:text-white">₹{offer.price}</span>
                                    </div>
                                  </div>
                                  
                                  <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 italic mb-3 line-clamp-2 flex-grow bg-white dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-700/30 leading-relaxed">"{offer.message}"</p>
                                  
                                  <div className="flex justify-end gap-2 mt-auto">
                                    {job.status === 'open' && (
                                      <button 
                                        onClick={() => handleAcceptOffer(offer.id, job.id)}
                                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-95"
                                      >
                                        Hire Next
                                      </button>
                                    )}
                                    {offer.status === 'accepted' && offer.helperPhone && (
                                      <a href={`tel:${offer.helperPhone}`} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white transition-all rounded-lg shadow-sm border border-blue-100 dark:border-blue-800/50 group/phone">
                                        <Phone className="w-3.5 h-3.5 group-hover/phone:animate-pulse" />
                                        <span className="text-[9px] font-bold uppercase tracking-wider group-hover/phone:text-white">Contact</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                mySentOffers.map(offer => {
                  const job = getJobForOffer(offer.jobId);
                  return (
                    <motion.div 
                      whileHover={{ y: -1 }}
                      key={offer.id} 
                      className="flex flex-col sm:flex-row p-4 sm:p-5 bg-white dark:bg-zinc-900/90 border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl gap-4 sm:gap-5 hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-300 group"
                    >
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5">
                          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pr-2">{job?.title}</h3>
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex-shrink-0 shadow-sm ${
                            offer.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' :
                            offer.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                            'bg-red-50 text-red-700 border border-red-200/50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
                          }`}>
                            {offer.status}
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                          <div className="flex items-center justify-between sm:justify-start gap-4">
                            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                              <span className="font-bold text-zinc-400 uppercase tracking-wider">Client</span>
                              <span className="font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded shadow-sm border border-zinc-100 dark:border-zinc-700">{job?.creatorName}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                              <span className="font-bold text-zinc-400 uppercase tracking-wider">Quote</span>
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded shadow-sm border border-indigo-100 dark:border-indigo-800/50">₹{offer.price}</span>
                            </div>
                          </div>

                          {job?.location && (
                            <>
                              <div className="hidden sm:block w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />
                              <a 
                                href={(job as any).coordinates ? `https://www.google.com/maps?q=${(job as any).coordinates.lat},${(job as any).coordinates.lng}` : `https://www.google.com/maps/search/${encodeURIComponent(job.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-100 dark:border-zinc-700 shadow-sm truncate w-fit max-w-[200px] mt-1 sm:mt-0 transition-colors"
                              >
                                <MapPin className="w-3 h-3 shrink-0 text-blue-500" />
                                <span className="font-medium truncate">{job.location}</span>
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-row items-center justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 mt-2 sm:mt-0">
                        {offer.status === 'accepted' && job?.creatorPhone && (
                           <a href={`tel:${job.creatorPhone}`} className="flex-1 sm:flex-none flex items-center justify-center p-2.5 sm:p-2 bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-600 hover:to-blue-600 dark:from-indigo-900/30 dark:to-blue-900/30 dark:hover:from-indigo-600 dark:hover:to-blue-600 text-indigo-600 dark:text-indigo-400 hover:text-white transition-all duration-300 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-700/50 group/call">
                             <Phone className="w-4 h-4 transform group-hover/call:rotate-12 transition-transform" />
                           </a>
                        )}
                        {job?.status === 'completed' && !isReviewed(offer.jobId, user.id, job?.creatorId || "") && (
                          <button 
                            onClick={() => setReviewTarget({ jobId: offer.jobId, toUserId: job?.creatorId || "", title: `Rate ${job?.creatorName}`, subtitle: "Mission Success!" })}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm shadow-amber-500/10 hover:shadow-md transition-all transform hover:scale-[1.02]"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            Review
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
