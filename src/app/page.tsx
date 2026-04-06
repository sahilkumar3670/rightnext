"use client";

import Link from 'next/link';
import { ShieldCheck, MapPin, Clock, Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-12 overflow-x-hidden">
      {/* Hero Section */}
      <section className="text-center space-y-8 mt-12 md:mt-24 relative">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white max-w-5xl mx-auto leading-[1.1]">
            Find Trusted Local Helpers <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              For Small Daily Tasks
            </span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mt-6">
            Request help for your small tasks and get offers from verified helpers in your neighborhood within minutes.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link
            href="/post-job"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
          >
            Request Help <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/jobs"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Search className="w-5 h-5" /> Find Work
          </Link>
        </motion.div>
      </section>

      {/* Features Grid with Scroll Reveal */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2
            }
          }
        }}
        className="grid md:grid-cols-3 gap-8 mt-12"
      >
        {[
          { icon: MapPin, title: "Hyperlocal Matches", color: "blue", desc: "Connect with helpers already in your neighborhood, keeping travel times minimal." },
          { icon: Clock, title: "Quick Turnaround", color: "green", desc: "Need something done today? Our network is ready to assist you right away." },
          { icon: ShieldCheck, title: "Trust & Safety", color: "purple", desc: "Verified users, phone auth, and a community rating system ensure you're in safe hands." }
        ].map((feat, i) => (
          <motion.div 
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
          >
            <div className={`w-14 h-14 bg-${feat.color}-100 dark:bg-${feat.color}-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <feat.icon className={`text-${feat.color}-600 dark:text-${feat.color}-400 w-7 h-7`} />
            </div>
            <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {feat.desc}
            </p>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
}
