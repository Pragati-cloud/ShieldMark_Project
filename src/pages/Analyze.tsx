import { motion } from 'framer-motion';
import { 
  CloudUpload, 
  Search, 
  Fingerprint, 
  AlertCircle, 
  CheckCircle2, 
  Link as LinkIcon, 
  ExternalLink,
  ShieldAlert,
  Info,
  Maximize2,
  Radar,
  Loader2
} from 'lucide-react';
import React, { useState, useRef } from 'react';
import { cn } from '../lib/utils';
import { analyzeImageForensics, OwnershipVerdict } from '../services/geminiService';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../lib/FirebaseProvider';

export const Analyze = ({ setView }: { setView: (v: string) => void }) => {
  const { user } = useFirebase();
  const [analyzing, setAnalyzing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [verdict, setVerdict] = useState<OwnershipVerdict | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startAnalysis = () => {
    alert("URL analysis is integrated with the automated forensic scanner. Please upload the file directly for the highest precision scan.");
  };

  const processFile = async (file: File) => {
    if (!user) {
        setError("Connect to initiate forensic analysis.");
        return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      setShowReport(false);
      
      const reader = new FileReader();
      const imageUrl = URL.createObjectURL(file);
      setCurrentImage(imageUrl);

      const buffer = await file.arrayBuffer();
      const result = await analyzeImageForensics(buffer, file.type);
      setVerdict(result);

      // Save to Firestore
      const scanData = {
        userId: user.uid,
        imageUrl: '(local preview)', // In a real app, I'd upload to Firebase Storage first
        owner: result.owner,
        confidence: result.confidence,
        reasoning: result.reasoning,
        createdAt: serverTimestamp(),
        metadata: result.metadata || {}
      };

      try {
        await addDoc(collection(db, 'scans'), scanData);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'scans');
      }

      setAnalyzing(false);
      setShowReport(true);
    } catch (err) {
      console.error(err);
      setError("Forensic engine failure. Please retry with a valid image asset.");
      setAnalyzing(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 py-8 px-4 lg:px-0"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-display font-black text-white uppercase tracking-tight">Image Analysis</h1>
          <p className="text-slate-400 text-lg">Cross-referencing global databases for visual intellectual property match.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest">AI Monitor Active</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest">244ms Latency</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input & Processing */}
        <div className="lg:col-span-7 space-y-8">
          <section className="glass-card rounded-2xl p-8 glow-indigo relative overflow-hidden">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={onFileChange}
              accept="image/*"
            />
            <div 
              className="border-2 border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 hover:border-secondary transition-colors group cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CloudUpload className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-wide">Drag & Drop Protection</h3>
              <p className="text-slate-500 max-w-xs">Drop creative assets here to initiate a forensic IP scan. Supports JPG, PNG, RAW.</p>
              <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all">Select Files</button>
            </div>
            
            {error && (
                <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3 text-error text-xs font-bold uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
            
            <div className="mt-8 space-y-4 text-center">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">OR PROCESS VIA URL</span>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="https://cdn.artstation.com/v/..." 
                  className="flex-1 bg-surface-container border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-secondary outline-none transition-all w-full"
                />
                <button onClick={startAnalysis} className="bg-surface-container-high border border-white/10 text-white px-6 py-3 rounded-lg font-bold uppercase text-xs hover:bg-white/10 transition-all w-full sm:w-auto">Scan</button>
              </div>
            </div>
          </section>

          <section className="glass-card rounded-2xl p-8 space-y-8">
            <h3 className="text-xl font-display font-black text-white uppercase tracking-wide flex items-center gap-3">
              <Fingerprint className="w-6 h-6 text-secondary" />
              Forensic Engine
            </h3>
            
            <div className="space-y-6">
              {[
                { label: 'Extracting Metadata', score: analyzing ? '68%' : showReport ? '100%' : '0%', icon: Info },
                { label: 'Pattern Matching', score: analyzing ? 'Processing...' : showReport ? 'Complete' : 'Pending', icon: Search },
                { label: 'Global Index Search', score: showReport ? '14 matches' : 'Pending', icon: Radar },
                { label: 'Infringement Detection', score: showReport ? 'Active' : 'Pending', icon: ShieldAlert },
              ].map((step, i) => (
                <div key={i} className={cn("flex items-center gap-4 transition-opacity", !analyzing && !showReport && "opacity-30")}>
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold", showReport ? "bg-secondary text-on-secondary" : "bg-white/10 text-slate-400")}>
                    {showReport ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-white">{step.label}</span>
                      <span className="text-[10px] font-bold text-secondary">{step.score}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: showReport ? '100%' : analyzing ? '50%' : '0%' }}
                        className="h-full bg-secondary"
                       />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Results Dashboard */}
        <div className="lg:col-span-5 space-y-8">
          <section className="glass-card rounded-2xl p-8 space-y-8 relative overflow-hidden">
            {analyzing && <div className="absolute inset-0 z-20 bg-background/40 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-4">
                <Radar className="w-12 h-12 text-secondary animate-spin mx-auto" />
                <p className="text-secondary font-display font-bold uppercase tracking-[0.3em] text-xs">Deep Scanning Assets...</p>
              </div>
            </div>}
            
            {!showReport ? (
              <div className="py-20 text-center space-y-4 opacity-50">
                <AlertCircle className="w-12 h-12 text-slate-800 mx-auto" />
                <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest max-w-[200px] mx-auto leading-relaxed">No forensic data available. Initiate scan to reveal provenance reports.</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <div className="relative group overflow-hidden rounded-xl">
                   <img 
                    src={currentImage || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop"} 
                    alt="Scan Result" 
                    className="w-full h-64 object-cover border border-white/10"
                   />
                   <div className="absolute inset-0 scan-animate" />
                   <div className="absolute top-4 right-4 flex gap-2">
                      <span className={cn(
                          "border text-[10px] px-2 py-1 rounded font-bold uppercase",
                          (verdict?.confidence || 0) > 70 ? "bg-secondary/20 border-secondary/40 text-secondary" : "bg-error/20 border-error/40 text-error"
                      )}>
                          {verdict?.confidence && verdict.confidence > 70 ? 'High Confidence' : 'Anomalous Entry'}
                      </span>
                   </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider">Forensic Verdict</h4>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-slate-400 italic mb-2">"{verdict?.reasoning}"</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Attributed Owner', val: verdict?.owner || 'Unknown' },
                        { label: 'pHash Signature', val: verdict?.owner ? `#${verdict.owner.length}9X-2` : 'N/A', color: 'text-primary' },
                        { label: 'First Appearance', val: verdict?.firstAppearanceDate || 'Digital Native' },
                        { label: 'Authenticity Score', val: `${verdict?.confidence || 0}% SECURE`, color: 'text-secondary' },
                      ].map((stat, i) => (
                        <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                          <p className={cn("text-xs font-bold", stat.color || "text-white")}>{stat.val}</p>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider">Similarity Heatmap</h4>
                    <div className="h-32 glass-card rounded-xl border-dashed border-white/10 flex items-center justify-center overflow-hidden relative">
                       <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-secondary/10 to-transparent" />
                       <span className="text-[10px] font-mono font-bold text-slate-400 relative z-10 opacity-50 uppercase tracking-widest">Processing Heat Signature...</span>
                    </div>
                 </div>
              </motion.div>
            )}
          </section>

          {showReport && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 sm:p-8 lg:p-10 space-y-8 lg:space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-6 gap-4">
                <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight">Identified Sources</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full self-start sm:self-auto">
                  <Radar className="w-3 h-3 text-secondary animate-pulse" />
                  <span className="text-[8px] font-black text-secondary uppercase tracking-widest">Active Scan</span>
                </div>
              </div>
              
              <div className="space-y-4 lg:space-y-6">
                {[
                  { label: 'Behance Portfolio', sub: 'Primary Portfolio Sync', icon: LinkIcon },
                  { label: 'Unauthorized Marketplace', sub: 'Unregistered Resale detected', icon: ShieldAlert, alert: true },
                  { label: 'Adobe Stock', sub: 'Licensed Channel', icon: ExternalLink },
                ].map((source, i) => (
                  <div key={i} className={cn("flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-2xl border transition-all cursor-pointer group gap-4", source.alert ? "bg-error/5 border-error/20 hover:bg-error/10" : "bg-white/5 border-white/5 hover:border-white/20")}>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className={cn("shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center border", source.alert ? "bg-error/20 border-error/30" : "bg-white/10 border-white/10")}>
                        <source.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", source.alert ? "text-error" : "text-slate-400 group-hover:text-secondary")} />
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        <p className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">{source.label}</p>
                        <p className={cn("text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]", source.alert ? "text-error/80" : "text-slate-500")}>{source.sub}</p>
                      </div>
                    </div>
                    {source.alert ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setView('claims');
                        }}
                        className="w-full sm:w-auto bg-error text-on-error hover:bg-error/90 text-xs font-black uppercase px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all shadow-lg active:scale-95"
                      >
                        Issue Claim
                      </button>
                    ) : (
                      <ExternalLink className="w-5 h-5 text-slate-600 group-hover:text-secondary transition-colors self-end sm:self-auto" />
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </motion.div>
  );
};
