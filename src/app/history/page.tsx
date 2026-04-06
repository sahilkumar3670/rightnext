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

export default function HistoryPage() {
  const { user, jobs, offers, reviews, updateJob, updateOffer, addReview, authLoading } = useStore();
  const [activeTab, setActiveTab] = useState<'my-jobs' | 'my-offers'>('my-jobs');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{jobId: string, toUserId: string, title: string, subtitle: string} | null>(null);

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
    <div className="max-w-4xl mx-auto py-6 px-4">
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

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Activity</h1>
        
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-max">
          <button
            onClick={() => setActiveTab('my-jobs')}
            className={`px-5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'my-jobs' ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-sm' : 'text-zinc-500'
            }`}
          >
            My Jobs ({myPostedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('my-offers')}
            className={`px-5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'my-offers' ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-zinc-500'
            }`}
          >
            My Offers ({mySentOffers.length})
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isRefreshing ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {(activeTab === 'my-jobs' ? myPostedJobs : mySentOffers).length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-400 font-bold text-[8px] uppercase tracking-widest">No history yet</p>
              </div>
            ) : (
              activeTab === 'my-jobs' ? (
                myPostedJobs.map(job => {
                  const jobOffers = getOffersForJob(job.id);
                  const hiredHelper = jobOffers.find(o => o.status === 'accepted');
                  return (
                    <div key={job.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 hover:border-blue-500/20 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">{job.title}</h3>
                            <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${
                              job.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {job.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 font-medium truncate max-w-[300px]">{job.description}</p>
                        </div>
                        
                        {job.status === 'assigned' && hiredHelper && (
                          <button 
                            onClick={() => handleCompleteJob(job.id, hiredHelper.helperId, hiredHelper.helperName)}
                            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[9px] font-black uppercase tracking-widest"
                          >
                            Mark Done
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 px-1">Proposals ({jobOffers.length})</p>
                        {jobOffers.map(offer => (
                          <div key={offer.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100/50 dark:border-zinc-800 gap-4">
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2">
                                 <span className="font-bold text-xs text-zinc-900 dark:text-white">{offer.helperName}</span>
                                 {offer.status === 'accepted' && <span className="text-[7px] font-black text-blue-600 uppercase tracking-widest">Hired</span>}
                               </div>
                               <p className="text-[10px] text-zinc-500 italic truncate italic">"{offer.message}"</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-black text-zinc-900 dark:text-white">₹{offer.price}</span>
                              {job.status === 'open' && (
                                <button 
                                  onClick={() => handleAcceptOffer(offer.id, job.id)}
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all font-black"
                                >
                                  Hire
                                </button>
                              )}
                              {offer.status === 'accepted' && offer.helperPhone && (
                                <a href={`tel:${offer.helperPhone}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                mySentOffers.map(offer => {
                  const job = getJobForOffer(offer.jobId);
                  return (
                    <div key={offer.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">{job?.title}</h3>
                          <div className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${
                            offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            offer.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {offer.status}
                          </div>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none">To: {job?.creatorName} | Quote: ₹{offer.price}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {offer.status === 'accepted' && job?.creatorPhone && (
                           <a href={`tel:${job.creatorPhone}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                             <Phone className="w-3.5 h-3.5" />
                           </a>
                        )}
                        {job?.status === 'completed' && !isReviewed(offer.jobId, user.id, job?.creatorId || "") && (
                          <button 
                            onClick={() => setReviewTarget({ jobId: offer.jobId, toUserId: job?.creatorId || "", title: `Rate ${job?.creatorName}`, subtitle: "Mission Success!" })}
                            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/10"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
