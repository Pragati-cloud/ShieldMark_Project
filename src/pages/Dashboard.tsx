import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '../lib/FirebaseProvider';
import { cn } from '../lib/utils';
import { Loader2, ShieldCheck, Gavel, BadgeCheck, Activity, Search, ArrowUpRight, AlertCircle, ShieldPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  const { user } = useFirebase();
  const [stats, setStats] = useState({ scans: 0, claims: 0, verified: 0 });
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch Scan Stats
    const scansQ = query(collection(db, 'scans'), where('userId', '==', user.uid));
    const unsubScans = onSnapshot(scansQ, (snap) => {
        setStats(prev => ({ ...prev, scans: snap.size }));
        const latest = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
            .slice(0, 3);
        setRecentScans(latest);
    });

    // Fetch Claim Stats
    const claimsQ = query(collection(db, 'claims'), where('userId', '==', user.uid));
    const unsubClaims = onSnapshot(claimsQ, (snap) => {
        setStats(prev => ({ ...prev, claims: snap.size }));
        const verifiedCount = snap.docs.filter(doc => doc.data().status === 'verified').length;
        setStats(prev => ({ ...prev, verified: verifiedCount }));
        setLoading(false);
    });

    return () => {
        unsubScans();
        unsubClaims();
    };
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 py-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
           <span className="text-[10px] font-black text-secondary tracking-[0.4em] uppercase">Sovereignty Dashboard</span>
           <h1 className="text-4xl sm:text-5xl font-display font-black text-white uppercase tracking-tight">Activity Overview</h1>
        </div>
        <div className="glass-card px-5 py-2.5 rounded-xl border-secondary/20 flex items-center gap-3 glow-cyan w-full sm:w-auto">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
           </span>
           <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Real-time Monitoring Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Images Scanned', val: stats.scans, trend: 'Visual forensics baseline', icon: ShieldCheck, color: 'text-primary' },
          { label: 'Active Claims', val: stats.claims, trend: 'Protection layers active', icon: Gavel, color: 'text-secondary' },
          { label: 'Verified Sovereignty', val: stats.verified, trend: 'Immutable registry status', icon: BadgeCheck, color: 'text-accent' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 rounded-[2rem] border-l-4 space-y-4" style={{ borderLeftColor: i === 0 ? 'var(--color-primary)' : i === 1 ? 'var(--color-secondary)' : 'var(--color-accent)' }}>
            <stat.icon className={cn("w-10 h-10", stat.color)} />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
               <h3 className="text-5xl font-display font-black text-white">{stat.val}</h3>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-secondary uppercase tracking-widest">
               {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-8">
            <section className="glass-card rounded-[2rem] p-8 space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-wider flex items-center gap-3">
                     <Activity className="w-6 h-6 text-primary" />
                     Recent Analyses
                  </h3>
               </div>
               
                <div className="space-y-4">
                  {loading ? (
                      <div className="flex items-center justify-center py-10">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                  ) : recentScans.length > 0 ? (
                    recentScans.map((item, i) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-white/3 border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                         <div className="w-12 h-12 sm:w-14 sm:h-14 bg-surface-container-high rounded-xl overflow-hidden flex items-center justify-center border border-white/5 shrink-0">
                            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-800" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white uppercase tracking-tight truncate">Forensic Scan #{i+1}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 truncate">Confidence: {item.confidence}% • Attributed: {item.owner || 'Unknown'}</p>
                         </div>
                         <div className={cn(
                             "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border self-start sm:self-auto",
                             (item.confidence || 0) > 80 ? "text-secondary bg-secondary/10 border-secondary/20" : "text-error bg-error/10 border-error/20"
                         )}>
                            {(item.confidence || 0) > 80 ? 'Verified' : 'Anomalous'}
                         </div>
                      </div>
                    ))
                  ) : (
                      <div className="py-10 text-center opacity-50">
                          <p className="text-[10px] font-bold uppercase tracking-widest">No recent scans detected.</p>
                      </div>
                  )}
               </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="glass-card rounded-[2rem] p-8 glow-cyan relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[60px]" />
                  <h4 className="text-sm font-display font-black text-white uppercase tracking-[0.2em] mb-8">AI Protection System</h4>
                  <div className="flex items-center gap-8">
                     <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                           <circle cx="48" cy="48" r="40" className="text-white/5" strokeWidth="8" fill="transparent" stroke="currentColor" />
                           <circle cx="48" cy="48" r="40" className="text-secondary" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="50.24" strokeLinecap="round" fill="transparent" stroke="currentColor" />
                        </svg>
                        <span className="absolute text-xl font-display font-black text-white">80%</span>
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-bold text-white uppercase">Model Defense</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active vs 14 scrapers</p>
                     </div>
                  </div>
               </div>
               
               <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden">
                  <h4 className="text-sm font-display font-black text-white uppercase tracking-[0.2em] mb-8">Network Health</h4>
                  <div className="flex items-center gap-8">
                     <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                           <circle cx="48" cy="48" r="40" className="text-white/5" strokeWidth="8" fill="transparent" stroke="currentColor" />
                           <circle cx="48" cy="48" r="40" className="text-primary" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="12.56" strokeLinecap="round" fill="transparent" stroke="currentColor" />
                        </svg>
                        <span className="absolute text-xl font-display font-black text-white">95%</span>
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-bold text-white uppercase">Uptime Stability</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">4,012 Active Nodes</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <aside className="lg:col-span-4 space-y-8">
            <section className="glass-card rounded-[2rem] p-8 space-y-8">
               <h3 className="text-xl font-display font-black text-white uppercase tracking-wider">Activity Feed</h3>
               <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                  {[
                    { title: 'New Asset Registered', icon: ArrowUpRight, time: '15 mins ago', desc: '"Vortex-7" secured on-chain.', color: 'bg-secondary' },
                    { title: 'Infringement Detected', icon: AlertCircle, time: '2 hours ago', desc: 'Unauthorized use: Solaris_P', color: 'bg-error' },
                    { title: 'Claim Resolution', icon: ShieldCheck, time: 'Yesterday', desc: 'Infringement #4022 settled.', color: 'bg-primary' },
                  ].map((item, i) => (
                    <div key={i} className="relative pl-10 group">
                       <div className={cn("absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-transform group-hover:scale-110", item.color)}>
                          <item.icon className="w-3 h-3 text-white" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{item.time}</p>
                          <h5 className="text-sm font-bold text-white uppercase">{item.title}</h5>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full py-4 rounded-xl border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:bg-white/5 transition-all">Load More Activity</button>
            </section>

            <section className="glass-card rounded-[2rem] p-8 space-y-6 bg-gradient-to-br from-primary/20 via-transparent to-transparent border-primary/20">
               <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center p-3 mb-2">
                  <ShieldPlus className="w-full h-full text-primary" />
               </div>
               <div className="space-y-2">
                  <h4 className="text-xl font-display font-black text-white uppercase tracking-wider">Upgrade Protection</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide leading-relaxed">Access automated DMCA takedowns and AI poisoning defense layers.</p>
               </div>
               <button className="w-full py-4 bg-primary text-white font-display font-black uppercase tracking-[0.2em] rounded-2xl glow-indigo hover:brightness-110 transition-all">Go Pro Now</button>
            </section>
         </aside>
      </div>
    </motion.div>
  );
};
