import { motion } from 'framer-motion';
import { 
  History as HistoryIcon, 
  Search, 
  Verified, 
  AlertTriangle, 
  XOctagon, 
  MoreVertical, 
  RefreshCw,
  Filter,
  Calendar,
  Loader2,
  ChevronDown,
  Check
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useFirebase } from '../lib/FirebaseProvider';
import { cn } from '../lib/utils';
import { AnimatePresence } from 'framer-motion';

const HistoryItem = ({ owner, createdAt, confidence, imageUrl }: any) => {
  const status = (confidence || 0) > 80 ? 'Verified' : (confidence || 0) > 40 ? 'Uncertain' : 'No Owner';
  
  const statusStyles: any = {
    Verified: 'bg-green-500/10 text-green-400 border-green-500/30',
    Uncertain: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    'No Owner': 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  const StatusIcon = status === 'Verified' ? Verified : status === 'Uncertain' ? AlertTriangle : XOctagon;
  const dateStr = createdAt?.toDate ? createdAt.toDate().toLocaleDateString() : 'Recent';

  return (
    <div className="glass-card hover:bg-white/10 transition-all p-4 rounded-2xl flex flex-col md:flex-row items-center gap-6 group">
      <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden shrink-0 border border-white/10 relative bg-surface-container flex items-center justify-center">
        {imageUrl && imageUrl !== '(local preview)' ? (
             <img src={imageUrl} alt="Asset" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
            <Search className="w-8 h-8 text-slate-700" />
        )}
      </div>
      
      <div className="flex-1 w-full space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-display font-bold text-white tracking-tight uppercase">Forensic Scan</h3>
          <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border", statusStyles[status])}>
            <StatusIcon className="w-3 h-3" />
            {status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Attributed</p>
            <p className="text-sm text-white truncate max-w-full sm:max-w-[150px]">{owner || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Scanned On</p>
            <p className="text-sm text-white">{dateStr}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Confidence Level</p>
            <p className={cn("text-sm font-bold", status === 'Verified' ? 'text-secondary' : status === 'Uncertain' ? 'text-yellow-400' : 'text-red-400')}>
              {confidence}%
            </p>
          </div>
          <div className="flex justify-end items-center sm:block">
            <button className="p-2 text-slate-500 hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HistoryPage = () => {
  const { user } = useFirebase();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [limitCount, setLimitCount] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('All Time');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) setShowStatusMenu(false);
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) setShowDateMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'scans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scanData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setScans(scanData);
      setLoading(false);
      setLoadingMore(false);
      
      // Simple check for more data
      if (snapshot.docs.length < limitCount) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scans');
      setLoading(false);
      setLoadingMore(false);
    });

    return unsubscribe;
  }, [user, limitCount]);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setLimitCount(prev => prev + 5);
  };

  const filteredScans = scans.filter(scan => {
    // Search Filter
    const matchesSearch = (scan.owner?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (scan.id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      'Forensic Scan'.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Status Filter
    const confidence = scan.confidence || 0;
    const status = confidence > 80 ? 'Verified' : confidence > 40 ? 'Uncertain' : 'No Owner';
    if (selectedStatus !== 'All' && status !== selectedStatus) return false;

    // Date Filter
    if (selectedDateRange !== 'All Time' && scan.createdAt) {
      const date = scan.createdAt.toDate ? scan.createdAt.toDate() : new Date();
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const dayInMs = 24 * 60 * 60 * 1000;

      if (selectedDateRange === 'Last 24h' && diff > dayInMs) return false;
      if (selectedDateRange === 'Last 7 Days' && diff > 7 * dayInMs) return false;
      if (selectedDateRange === 'Last 30 Days' && diff > 30 * dayInMs) return false;
    }

    return true;
  });

  const statuses = ['All', 'Verified', 'Uncertain', 'No Owner'];
  const dates = ['All Time', 'Last 24h', 'Last 7 Days', 'Last 30 Days'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 py-8"
    >
      <div className="space-y-4">
        <h1 className="text-5xl font-display font-black text-white uppercase tracking-tight">Analysis History</h1>
        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
          Track and manage your scanned assets. ShieldMark identifies unauthorized usage and cryptographic signatures across the neural net.
        </p>
      </div>

      <section className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by asset name or owner..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container border border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:border-secondary outline-none transition-all"
          />
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
           <div className="relative w-full sm:w-auto" ref={statusRef}>
             <button 
               onClick={() => setShowStatusMenu(!showStatusMenu)}
               className={cn(
                 "w-full flex items-center justify-between sm:justify-start gap-2 px-6 py-4 glass-card rounded-2xl text-xs font-bold uppercase tracking-widest hover:border-secondary transition-all",
                 selectedStatus !== 'All' && "border-secondary text-secondary"
               )}
             >
               <div className="flex items-center gap-2">
                 <Filter className="w-4 h-4" />
                 {selectedStatus === 'All' ? 'Status' : selectedStatus}
               </div>
               <ChevronDown className={cn("w-3 h-3 transition-transform", showStatusMenu && "rotate-180")} />
             </button>
             
             <AnimatePresence>
               {showStatusMenu && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="absolute top-full mt-2 left-0 w-full sm:w-48 glass-card border border-white/10 rounded-2xl overflow-hidden z-50 p-2"
                 >
                   {statuses.map(s => (
                     <button
                       key={s}
                       onClick={() => { setSelectedStatus(s); setShowStatusMenu(false); }}
                       className="w-full text-left px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-white/5 rounded-xl transition-all flex items-center justify-between group"
                     >
                       <span className={cn(selectedStatus === s ? "text-secondary" : "text-slate-400 group-hover:text-white")}>{s}</span>
                       {selectedStatus === s && <Check className="w-3 h-3 text-secondary" />}
                     </button>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

           <div className="relative w-full sm:w-auto" ref={dateRef}>
             <button 
               onClick={() => setShowDateMenu(!showDateMenu)}
               className={cn(
                 "w-full flex items-center justify-between sm:justify-start gap-2 px-6 py-4 glass-card rounded-2xl text-xs font-bold uppercase tracking-widest hover:border-secondary transition-all",
                 selectedDateRange !== 'All Time' && "border-secondary text-secondary"
               )}
             >
               <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4" />
                 {selectedDateRange}
               </div>
               <ChevronDown className={cn("w-3 h-3 transition-transform", showDateMenu && "rotate-180")} />
             </button>

             <AnimatePresence>
               {showDateMenu && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="absolute top-full mt-2 left-0 w-full sm:w-48 glass-card border border-white/10 rounded-2xl overflow-hidden z-50 p-2"
                 >
                   {dates.map(d => (
                     <button
                       key={d}
                       onClick={() => { setSelectedDateRange(d); setShowDateMenu(false); }}
                       className="w-full text-left px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-white/5 rounded-xl transition-all flex items-center justify-between group"
                     >
                       <span className={cn(selectedDateRange === d ? "text-secondary" : "text-slate-400 group-hover:text-white")}>{d}</span>
                       {selectedDateRange === d && <Check className="w-3 h-3 text-secondary" />}
                     </button>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>
      </section>

      <div className="space-y-4 pb-20">
        {loading ? (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            </div>
        ) : filteredScans.length > 0 ? (
          filteredScans.map((item) => (
            <HistoryItem key={item.id} {...item} />
          ))
        ) : (
            <div className="py-20 text-center glass-card rounded-2xl space-y-4">
                <Search className="w-12 h-12 text-slate-800 mx-auto" />
                <p className="text-slate-500 uppercase tracking-widest font-bold text-xs leading-relaxed">
                    {searchTerm ? `No results found for "${searchTerm}"` : "No forensic records found for this identity."}
                    <br /> Connect assets to begin monitoring.
                </p>
            </div>
        )}
      </div>

      {hasMore && scans.length > 0 && (
        <div className="flex justify-center pb-20">
          <button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-10 py-4 bg-primary text-white font-display font-bold uppercase tracking-[0.2em] rounded-full hover:glow-indigo transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loadingMore ? 'Syncing...' : 'Load Older Scans'}
            <RefreshCw className={cn("w-5 h-5", loadingMore && "animate-spin")} />
          </button>
        </div>
      )}
    </motion.div>
  );
};
