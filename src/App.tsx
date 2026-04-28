/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Search, 
  History as HistoryIcon, 
  Gavel, 
  Settings, 
  Menu, 
  X,
  Plus,
  Verified,
  CloudUpload,
  PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase } from './lib/FirebaseProvider';
import { signInWithGoogle, auth } from './lib/firebase';
import { LogIn, LogOut, Radar, Fingerprint, ShieldCheck, AlertCircle, TrendingUp, Activity, ArrowUpRight, ShieldPlus } from 'lucide-react';
import { cn } from './lib/utils';
import { Analyze } from './pages/Analyze';
import { Dashboard } from './pages/Dashboard';
import { HistoryPage } from './pages/History';
import { Claims } from './pages/Claims';

// --- Components ---

const Sidebar = ({ currentView, setView }: { currentView: string; setView: (v: string) => void }) => {
  const menuItems = [
    { id: 'landing', label: 'Overview', icon: LayoutDashboard },
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'analyze', label: 'Analyze', icon: Search },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'claims', label: 'Claims', icon: Gavel },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass-card z-50 hidden lg:flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="p-2 bg-primary rounded-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-display font-black tracking-widest text-white uppercase">SHIELDMARK</span>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl font-display text-sm uppercase tracking-wider transition-all",
              currentView === item.id 
                ? "bg-primary/10 text-secondary border-r-2 border-secondary" 
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-1">
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-display text-sm uppercase tracking-wider">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </aside>
  );
};

const TopBar = ({ toggleMobileMenu }: { toggleMobileMenu: () => void }) => {
  const { user } = useFirebase();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass-card z-40 px-6 flex items-center justify-between lg:pl-72">
      <div className="flex items-center gap-4">
        <button onClick={toggleMobileMenu} className="lg:hidden p-2 text-white">
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden lg:flex items-center gap-2">
           <span className="text-xs font-display font-bold text-secondary uppercase tracking-[0.2em] border border-secondary/20 px-2 py-1 rounded">Sovereignty Active</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-white uppercase tracking-tight">{user.displayName || 'Creator'}</div>
              <div className="text-[10px] text-secondary uppercase tracking-widest">Digital Sovereign</div>
            </div>
            <button 
              onClick={() => auth.signOut()}
              className="group relative w-10 h-10 rounded-full border border-primary/30 overflow-hidden hover:border-secondary transition-all"
            >
              <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="Avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <LogOut className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>
        ) : (
          <button 
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-6 py-2 bg-primary rounded-full text-xs font-bold uppercase tracking-widest hover:glow-indigo transition-all"
          >
            <LogIn className="w-4 h-4" />
            Connect
          </button>
        )}
      </div>
    </header>
  );
};

const Landing = ({ setView }: { setView: (v: string) => void }) => {
  const { user } = useFirebase();

  const handleAction = () => {
    if (!user) {
      signInWithGoogle();
    } else {
      setView('analyze');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16 py-12"
    >
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-accent">
          <Verified className="w-4 h-4" />
          <span className="text-[10px] font-display font-bold uppercase tracking-widest">Sovereignty Secured</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-display font-black text-white leading-tight">
          Find the Real <span className="text-secondary italic">Owner</span> <br /> of Any Image
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 text-lg">
          AI-powered visual forensics. Reclaim your creative intellectual property across the digital void.
        </p>
        
        <div className="max-w-2xl mx-auto glass-card p-1 rounded-2xl glow-indigo">
          <div className="glass-card bg-surface/50 rounded-xl p-8 space-y-6">
            <div 
              onClick={handleAction}
              className="border-2 border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-secondary transition-all group"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CloudUpload className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">{user ? 'Drag & Drop Image' : 'Connect to Start'}</h3>
              <p className="text-slate-500">{user ? 'Supports JPG, PNG up to 50MB' : 'Sign in to access forensics engine'}</p>
            </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] font-bold text-slate-600 uppercase">OR</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Paste image URL..." 
              className="flex-1 bg-surface-container border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-secondary outline-none transition-all w-full"
            />
            <button 
              onClick={() => setView('analyze')}
              className="bg-primary hover:bg-primary/90 text-white font-display font-bold px-8 py-3 rounded-lg uppercase text-sm tracking-widest transition-all w-full sm:w-auto"
            >
              Analyze
            </button>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { step: '01', title: 'Upload', icon: CloudUpload, desc: 'Provide high-res image or URL for scan.' },
        { step: '02', title: 'AI Forensic', icon: Fingerprint, desc: 'Detect pixel-level markers & AI signatures.' },
        { step: '03', title: 'Trace Origin', icon: Radar, desc: 'Cross-reference global creative records.' },
        { step: '04', title: 'Reclaim', icon: Gavel, desc: 'Generate verified ownership certificates.' },
      ].map((item) => (
        <div key={item.step} className="glass-card p-6 rounded-xl relative group">
          <div className="absolute -top-3 -left-3 w-8 h-8 bg-surface-container-high rounded-full flex items-center justify-center text-secondary font-bold border border-secondary/20">
            {item.step}
          </div>
          <item.icon className="w-8 h-8 text-slate-500 mb-6 group-hover:text-secondary transition-colors" />
          <h4 className="text-lg font-display font-bold text-white mb-2">{item.title}</h4>
          <p className="text-sm text-slate-500">{item.desc}</p>
        </div>
      ))}
    </div>
  </motion.div>
  );
};

// --- App Root ---

export default function App() {
  const [view, setView] = useState('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans bg-background text-white selection:bg-secondary/30">
      <Sidebar currentView={view} setView={setView} />
      <TopBar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] lg:hidden flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
               <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-primary" />
                    <span className="text-xl font-display font-black text-white uppercase tracking-widest">SHIELDMARK</span>
               </div>
               <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-8 h-8 text-white" />
               </button>
            </div>
            
            <nav className="space-y-4">
              {[
                { id: 'landing', label: 'Overview' },
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'analyze', label: 'Analyze' },
                { id: 'history', label: 'History' },
                { id: 'claims', label: 'Claims' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setView(item.id); setMobileMenuOpen(false); }}
                  className={cn(
                    "w-full text-left py-4 text-2xl font-display font-bold uppercase tracking-widest",
                    view === item.id ? "text-secondary" : "text-slate-500"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="lg:pl-64 pt-24 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto overflow-x-hidden">
        {(() => {
          switch (view) {
            case 'landing': return <Landing setView={setView} />;
            case 'dashboard': return <Dashboard />;
            case 'analyze': return <Analyze setView={setView} />;
            case 'history': return <HistoryPage />;
            case 'claims': return <Claims />;
            default: return <Landing setView={setView} />;
          }
        })()}
      </main>

      {/* Floating Action */}
      <button 
        onClick={() => setView('analyze')}
        className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border border-white/20 glow-indigo"
      >
        <Plus className="w-8 h-8 text-white" />
      </button>

      {/* Footer */}
      <footer className="lg:pl-64 py-32 px-6 border-t border-white/5 opacity-70">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24">
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-xl font-display font-black uppercase tracking-[0.25em]">SHIELDMARK</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] leading-[2.2] text-slate-500 max-w-[360px]">
              SOVEREIGN IP PROTECTION ENGINE.<br />
              POWERED BY GOOGLE CLOUD FORENSICS.
            </p>
          </div>
          {[
            { 
              cat: 'Product', 
              links: ['Overview', 'Forensics Engine', 'API Access', 'Batch Analysis'] 
            },
            { 
              cat: 'Legal', 
              links: ['Privacy Protocol', 'Sovereignty Terms', 'Copyright Policy', 'DMCA Support'] 
            },
            { 
              cat: 'Resources', 
              links: ['Documentation', 'Verification Guide', 'Case Studies', 'Registry'] 
            }
          ].map((section) => (
            <div key={section.cat} className="space-y-8">
                <h5 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">{section.cat}</h5>
                <nav className="flex flex-col gap-4 text-sm font-bold uppercase tracking-[0.1em] text-slate-500">
                    {section.links.map(link => (
                      <button key={link} className="text-left hover:text-secondary transition-colors cursor-pointer">{link}</button>
                    ))}
                </nav>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
