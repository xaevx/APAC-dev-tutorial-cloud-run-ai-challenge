import React from 'react';
import { 
  Sparkles, 
  CheckSquare, 
  Target, 
  HelpCircle, 
  Smile, 
  Tag, 
  Calendar, 
  FileText,
  ArrowRight
} from 'lucide-react';

export default function SessionSummaryCard({ session, onBackToChat }) {
  if (!session || !session.summary) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-center text-slate-400">
        No session summary available.
      </div>
    );
  }

  const { summary } = session;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(session.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          {summary.emotion_tone && (
            <span className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
              <Smile className="w-3.5 h-3.5" />
              <span>{summary.emotion_tone}</span>
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">
          {session.title || summary.main_topic}
        </h1>

        <p className="text-sm text-slate-300">
          {summary.main_topic}
        </p>

        {/* Tags */}
        {summary.tags && summary.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {summary.tags.map((tag, idx) => (
              <span key={idx} className="flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                <Tag className="w-3 h-3 text-cyan-400" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Key Thoughts */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-cyan-400 mb-3">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-200">Key Thoughts & Insights</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(summary.key_thoughts || []).map((thought, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>{thought}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Items */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-400 mb-3">
            <CheckSquare className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-200">Action Items</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(summary.action_items || []).map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stated Goals */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-indigo-400 mb-3">
            <Target className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-200">Identified Goals</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(summary.goals || []).map((goal, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-indigo-400 mt-0.5">🎯</span>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Unresolved Questions */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-amber-400 mb-3">
            <HelpCircle className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-200">Unresolved Questions & Doubts</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(summary.unresolved_questions || []).map((q, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-amber-400 mt-0.5">?</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Raw Conversation Log */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <FileText className="w-4 h-4" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Conversation Log ({session.messages?.length || 0} turns)</h3>
          </div>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {(session.messages || []).map((m, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
              <div className="font-semibold text-slate-400 mb-1">{m.role === 'user' ? 'You' : 'MindLoom AI'}:</div>
              <p className="text-slate-300">{m.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={onBackToChat}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all"
        >
          <span>Start New Journal Session</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
