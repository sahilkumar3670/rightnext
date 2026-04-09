"use client";

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Lightbulb,
  MousePointer2
} from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center bg-zinc-100 rounded-2xl dark:bg-zinc-800 text-sm">Loading high-precision map...</div>
});

export default function PostJob() {
  const { user, addJob } = useStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    location: '',
    scheduledDate: '',
  });
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.budget) {
      toast.error('Please fill in the core details.');
      return;
    }

    setLoading(true);
    try {
      const newJob = {
        title: formData.title,
        description: formData.description,
        budget: Number(formData.budget),
        location: formData.location || "Nearby Area",
        coordinates: coordinates || undefined,
        creatorId: user.id,
        creatorName: user.name,
        creatorPhone: user.phone,
        creatorVerified: user.isVerified || false,
        status: 'open' as const,
        createdAt: Date.now(),
        scheduledDate: formData.scheduledDate || undefined,
      };

      await addJob(newJob);
      toast.success('Your request is live now! 🚀');
      router.push('/jobs');
    } catch {
      toast.error('Failed to post. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Main Form Area */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-600" />
              Describe your task
            </h1>
            <p className="text-zinc-500 font-medium text-lg leading-relaxed">
              Fill in the details below. Our community in <span className="text-blue-600 font-bold">Gurgaon</span> is ready to help you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6 bg-white dark:bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl">
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 px-1">What do you need help with?</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Broken AC repair or Furniture assembly"
                  className="w-full text-xl font-bold bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 px-6 py-4 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Describe the details</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Tell your neighbor exactly what needs to be done..."
                  className="w-full font-medium bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 px-6 py-4 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Budget (INR)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="number"
                      name="budget"
                      required
                      placeholder="500"
                      className="w-full pl-12 pr-6 py-4 text-xl font-black bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      value={formData.budget}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 px-1">When (Optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="date"
                      name="scheduledDate"
                      className="w-full pl-12 pr-6 py-4 text-sm font-bold bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      value={formData.scheduledDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between px-1">
                 <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-blue-600" /> Set Pickup/Work Location
                 </h4>
                 {coordinates && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase"><CheckCircle2 className="w-3 h-3" /> Location Fixed</span>}
               </div>
               
               <div className="relative group p-1 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden min-h-[340px]">
                 <MapPicker onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })} />
                 
                 {!coordinates && (
                   <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center p-8 text-center bg-black/5 dark:bg-black/20 backdrop-blur-[2px] rounded-[2rem]">
                     <MousePointer2 className="w-8 h-8 text-blue-600 mb-4 animate-bounce" />
                     <p className="text-blue-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Tap your exact house/work spot on the map</p>
                   </div>
                 )}
               </div>
               
               <input
                 type="text"
                 name="location"
                 placeholder="Area/Building Name (e.g. DLF Phase 3)"
                 className="w-full font-bold text-sm bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 px-6 py-4 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-lg shadow-zinc-200/20"
                 value={formData.location}
                 onChange={handleChange}
               />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => router.push('/jobs')}
                className="w-full sm:w-1/3 py-5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.1em] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-2/3 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? "Optimizing Post..." : <><ArrowRight className="w-5 h-5" /> Post my request</>}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Sidebar Tips */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="p-8 bg-zinc-900 dark:bg-blue-600 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
            <h3 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-400" /> Posting Tips
            </h3>
            <ul className="space-y-5">
              {[
                { t: "Be Specific", d: "Mention if tools are required for the task." },
                { t: "Fair Price", d: "Neighbors respond 2x faster to realistic budgets." },
                { t: "Deadlines", d: "Set a date if it's urgent to help helpers plan." },
                { t: "Safety", d: "Never share sensitive private bank details in the description." }
              ].map((tip, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">{i+1}</div>
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest">{tip.t}</h4>
                    <p className="text-[11px] opacity-70 font-medium leading-relaxed mt-1">{tip.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600">
                 <CheckCircle2 className="w-5 h-5" />
               </div>
               <h4 className="text-xs font-black uppercase tracking-widest">RightNext Guarantee</h4>
             </div>
             <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
               All posts are strictly restricted to your local radius. Your data is encrypted and only shared with the person you choose to hire.
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
