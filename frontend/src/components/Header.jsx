import React from 'react';
import { useAuth } from '../firebase/authContext';
import { 
  Sparkles, 
  BrainCircuit, 
  ShieldCheck, 
  History, 
  PlusCircle, 
  LogOut, 
  LogIn, 
  Users,
  Compass
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenAuth, onOpenSecurity }) {
  const { currentUser, logout, signInDemoUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight">MindLoom</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                Gemini 1.5
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Secure Reflective Journal & Thought Analytics</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Journal</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>

          <button
            onClick={() => setActiveTab('evolution')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'evolution'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Thought Evolution</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">Original</span>
          </button>
        </nav>

        {/* User Account & Security Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Security Status Trigger */}
          <button
            onClick={onOpenSecurity}
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            title="Inspect Firebase Auth & Firestore Zero-Trust Security Architecture"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Trust Active</span>
          </button>

          {currentUser ? (
            <div className="flex items-center space-x-3">
              
              {/* User Switcher Quick Demo Controls */}
              <div className="hidden lg:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-500 px-1 font-mono text-[10px]">Isolation Test:</span>
                <button
                  onClick={() => signInDemoUser('demo_user_alpha')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    currentUser.uid === 'uid_demo_user_alpha' 
                      ? 'bg-cyan-500 text-slate-950 font-bold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  User A
                </button>
                <button
                  onClick={() => signInDemoUser('demo_user_beta')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    currentUser.uid === 'uid_demo_user_beta' 
                      ? 'bg-purple-500 text-slate-950 font-bold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  User B
                </button>
              </div>

              {/* User Profile Pill */}
              <div className="flex items-center space-x-2 glass-panel px-3 py-1.5 rounded-lg border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 text-xs font-bold">
                  {currentUser.displayName ? currentUser.displayName[0] : (currentUser.email ? currentUser.email[0].toUpperCase() : 'U')}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                    {currentUser.displayName || currentUser.email || 'Authenticated User'}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    UID: {currentUser.uid.substring(0, 10)}...
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Sign Out Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-semibold px-4 py-1.5 rounded-lg text-sm shadow-md shadow-cyan-500/20 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
