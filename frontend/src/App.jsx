import React, { useState } from 'react';
import { AuthProvider, useAuth } from './firebase/authContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import ChatInterface from './components/ChatInterface';
import SessionSummaryCard from './components/SessionSummaryCard';
import SessionHistory from './components/SessionHistory';
import ThoughtEvolution from './components/ThoughtEvolution';
import SecurityBadge from './components/SecurityBadge';
import { Sparkles, Shield, LogIn, Lock } from 'lucide-react';

function MainAppContent() {
  const { currentUser, loading, signInDemoUser } = useAuth();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'summary' | 'history' | 'evolution'
  const [selectedSession, setSelectedSession] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  const handleSessionCompleted = (session) => {
    setSelectedSession(session);
    setActiveTab('summary');
  };

  const handleSelectHistorySession = (session) => {
    setSelectedSession(session);
    setActiveTab('summary');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      
      {/* Background ambient lighting effects */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSecurity={() => setIsSecurityOpen(true)}
      />

      {/* Primary Workspace */}
      <main className="flex-1 z-10">
        {loading ? (
          <div className="h-[80vh] flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            <span className="text-xs font-mono text-cyan-400">Resolving Firebase Authentication State...</span>
          </div>
        ) : !currentUser ? (
          <div className="max-w-xl mx-auto my-16 p-8 glass-panel rounded-3xl border border-slate-800 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-100">Authentication Required</h1>
              <p className="text-sm text-slate-400">
                To guarantee zero-trust per-user data isolation, please sign in with Firebase Auth or launch Demo Mode.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </button>

              <button
                onClick={() => signInDemoUser('demo_user_alpha')}
                className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-850 text-cyan-300 font-semibold px-6 py-3 rounded-xl text-sm border border-slate-800 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Instant Demo Mode (User A)</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'chat' && (
              <ChatInterface onSessionCompleted={handleSessionCompleted} />
            )}

            {activeTab === 'summary' && (
              <SessionSummaryCard 
                session={selectedSession} 
                onBackToChat={() => setActiveTab('chat')} 
              />
            )}

            {activeTab === 'history' && (
              <SessionHistory onSelectSession={handleSelectHistorySession} />
            )}

            {activeTab === 'evolution' && (
              <ThoughtEvolution />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="z-10 py-4 px-6 text-center text-xs text-slate-600 border-t border-slate-900">
        <span>MindLoom AI • Google Cloud Ideathon Challenge Submission • Powered by Gemini 1.5, Firebase Auth, Secret Manager & Cloud Run</span>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SecurityBadge isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
