import { motion } from 'framer-motion';
import { 
  Edit3, 
  Calendar, 
  FileText, 
  CloudUpload, 
  Gavel, 
  Verified, 
  Copy,
  Radar,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../lib/FirebaseProvider';

export const Claims = () => {
  const { user } = useFirebase();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [creatorName, setCreatorName] = useState(user?.displayName || 'CREATOR_01');
  const [creationDate, setCreationDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    const claimData = {
        userId: user.uid,
        creatorName,
        creationDate,
        description,
        status: 'pending',
        createdAt: serverTimestamp(),
        registryId: `SHLD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    try {
        await addDoc(collection(db, 'claims'), claimData);
        setSubmitted(true);
    } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'claims');
        setError("Sovereignty protocol failure. Please retry submission.");
    } finally {
        setLoading(false);
    }
  };

  if (submitted) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center gap-6"
        >
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center border border-secondary/20 glow-cyan">
                <CheckCircle className="w-10 h-10 text-secondary" />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight">Sovereignty Claim Filed</h1>
                <p className="text-slate-400 max-w-sm mx-auto">Your creative identity has been immutably indexed. The verification nodes are now processing your evidence.</p>
            </div>
            <button 
                onClick={() => setSubmitted(false)}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
            >
                Back to Dashboard
            </button>
        </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 py-8"
    >
      <div className="space-y-4">
        <h1 className="text-5xl font-display font-black text-white uppercase tracking-tight">Claim Ownership</h1>
        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
          Establish your creative sovereignty by securing your intellectual property on the ShieldMark metadata registry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-7 space-y-8">
          <section className="glass-card rounded-2xl p-8 space-y-8">
            <h2 className="text-xl font-display font-black text-white uppercase tracking-wide flex items-center gap-3">
              <Edit3 className="w-6 h-6 text-secondary" />
              Ownership Details
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Creator Name</label>
                  <input 
                    type="text" 
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-3 focus:border-secondary outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Creation Date</label>
                  <input 
                    type="date" 
                    value={creationDate}
                    onChange={(e) => setCreationDate(e.target.value)}
                    className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-3 focus:border-secondary outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context about the creation process, inspiration, and tools used..."
                  className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-3 focus:border-secondary outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2 opacity-50 cursor-not-allowed">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidence & Proof (Manual for Prototype)</label>
                 <div className="border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center space-y-3 bg-white/3 text-center">
                    <CloudUpload className="w-10 h-10 text-slate-600" />
                    <p className="text-sm font-bold uppercase tracking-wider text-white">Upload Multi-layer project</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Supports .PSD, .AI, .RAW up to 100MB</p>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={loading || !user}
                className="w-full py-5 bg-primary text-white font-display font-black uppercase tracking-[0.2em] rounded-xl glow-indigo hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Gavel className="w-6 h-6" />}
                {user ? 'Claim This Image' : 'Connect Wallet to Claim'}
              </button>

              {error && (
                  <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                  </div>
              )}
            </form>
          </section>

          <div className="glass-card rounded-2xl p-6 border-l-4 border-secondary flex items-center justify-between glow-cyan">
             <div className="flex items-center gap-4">
                <Radar className="w-8 h-8 text-secondary animate-pulse" />
                <div>
                   <h4 className="text-sm font-display font-bold text-white uppercase">Active Sentinel Monitoring</h4>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest">Real-time AI scraping protection engaged</p>
                </div>
             </div>
             <span className="hidden sm:inline-block px-3 py-1 rounded bg-secondary/10 text-secondary text-[10px] font-bold border border-secondary/20 uppercase tracking-widest">Secured</span>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="lg:col-span-5">
           <div className="sticky top-24 space-y-6">
              <h2 className="text-xl font-display font-black text-white uppercase tracking-wide px-2">Preview Certificate</h2>
              
              <div className="glass-card rounded-[2rem] overflow-hidden border border-white/20 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[100px]" />
                 
                 <div className="aspect-square bg-surface-container overflow-hidden p-6">
                    <div className="w-full h-full rounded-2xl overflow-hidden relative border border-white/5">
                        <img 
                            src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000" 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                 </div>

                 <div className="p-8 pt-2 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Ownership Certificate</p>
                            <h3 className="text-2xl font-display font-bold text-white">Neural Drift #04</h3>
                        </div>
                        <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center p-2">
                           <Verified className="w-full h-full text-secondary" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-6 border-y border-white/5">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registrant</p>
                            <p className="text-sm font-bold text-white uppercase">CREATOR_01</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TIMESTAMP</p>
                            <p className="text-sm font-bold text-white uppercase">OCT 24, 2024</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registry ID</p>
                        <div className="flex items-center gap-3 bg-surface border border-white/5 p-3 rounded-lg">
                           <code className="flex-1 text-[10px] text-secondary font-mono tracking-tighter">SHLD-8829-00X1-BLCK-VERIFIED</code>
                           <Copy className="w-4 h-4 text-slate-600 hover:text-white transition-colors cursor-pointer" />
                        </div>
                    </div>

                    <div className="flex justify-center pt-4">
                        <div className="flex items-center gap-2 border border-secondary/20 bg-secondary/5 px-6 py-2 rounded-full">
                           <Verified className="w-4 h-4 text-secondary" />
                           <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Verified Sovereignty</span>
                        </div>
                    </div>
                 </div>
              </div>
              <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest opacity-50">Immuntably hashed on ShieldMark Registry.</p>
           </div>
        </div>
      </div>
    </motion.div>
  );
};
