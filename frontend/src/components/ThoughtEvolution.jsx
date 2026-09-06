import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/authContext';
import { apiFetch } from '../api/client';
import { 
  Compass, 
  Sparkles, 
  Search, 
  HelpCircle, 
  TrendingUp, 
  Milestone, 
  RefreshCw,
  Brain,
  MessageSquare
} from 'lucide-react';

export default function ThoughtEvolution() {
  const { idToken, currentUser } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvolutionReport = async (queryText = '') => {
    if (!idToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/evolution/analyze', {
        method: 'POST',
        body: JSON.stringify({ query: queryText })
      }, idToken);
      
      setReport(data.report);
    } catch (err) {
      console.error('[ThoughtEvolution Error]', err);
      setError('Failed to analyze thought evolution.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvolutionReport();
  }, [idToken, currentUser?.uid]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvolutionReport(searchQuery);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn">
      
      {/* Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-slate-950 via-purple-950/20 to-slate-950 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30 mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>ORIGINAL CHALLENGE FEATURE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mb-2 tracking-tight">
            Thought Evolution Engine
          </h1>
          <p className="text-sm text-slate-300">
            Synthesizes long-term patterns across your isolated journal history. Discover how your ideas develop, track unresolved doubts, and ask natural language questions across your past self.
          </p>
        </div>
      </div>

      {/* Semantic Journal Q&A Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Ask your past self: e.g. "What were my main doubts about my career?"'
              className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Synthesizing...' : 'Synthesize Insights'}</span>
          </button>
        </form>
      </div>

      {/* Q&A Answer Card */}
      {report?.query_answer && (
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/40 bg-purple-950/20">
          <div className="flex items-center space-x-2 text-purple-300 font-bold text-sm mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>Journal Synthesis Answer for: "{searchQuery}"</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            {report.query_answer}
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 space-x-2 text-xs font-mono">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
          <span>Gemini is synthesizing long-term thought evolution...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      ) : report ? (
        <div className="space-y-6">
          
          {/* Overarching Synthesis Headline */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-mono uppercase text-slate-400 mb-2">Overarching Mindset Evolution</h3>
            <p className="text-base font-semibold text-slate-100">
              "{report.synthesis_headline}"
            </p>
          </div>

          {/* Recurring Themes Grid */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-2 text-cyan-400 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h2 className="text-base font-bold text-slate-100">Cross-Session Recurring Themes</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(report.recurring_themes || []).map((theme, idx) => (
                <div key={idx} className="glass-card p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-200">{theme.theme}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                      {theme.session_count} session(s)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {theme.evolution}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Radar & Milestones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Unresolved Thought Radar */}
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/20">
              <div className="flex items-center space-x-2 text-amber-400 mb-4">
                <HelpCircle className="w-5 h-5" />
                <h2 className="text-base font-bold text-slate-100">Unresolved Thought Radar</h2>
              </div>
              <ul className="space-y-3">
                {(report.unresolved_thought_radar || []).map((item, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-amber-400 mt-0.5 font-bold">?</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Milestones */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center space-x-2 text-emerald-400 mb-4">
                <Milestone className="w-5 h-5" />
                <h2 className="text-base font-bold text-slate-100">Key Growth Milestones</h2>
              </div>
              <ul className="space-y-3">
                {(report.key_milestones || []).map((m, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
}
