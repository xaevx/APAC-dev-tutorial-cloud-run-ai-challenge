import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/authContext';
import { apiFetch } from '../api/client';
import { 
  History, 
  Search, 
  Trash2, 
  ChevronRight, 
  Calendar, 
  Tag, 
  RefreshCw,
  Lock,
  Sparkles
} from 'lucide-react';

export default function SessionHistory({ onSelectSession }) {
  const { idToken, currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSessions = async () => {
    if (!idToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/sessions', {}, idToken);
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('[SessionHistory Error]', err);
      setError('Failed to fetch historical journal entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [idToken, currentUser?.uid]);

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this session entry?')) return;

    try {
      await apiFetch(`/api/sessions/${sessionId}`, { method: 'DELETE' }, idToken);
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err) {
      alert('Failed to delete session: ' + err.message);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const q = searchQuery.toLowerCase();
    const titleMatch = (s.title || '').toLowerCase().includes(q);
    const topicMatch = (s.summary?.main_topic || '').toLowerCase().includes(q);
    const tagMatch = (s.tags || []).some(t => t.toLowerCase().includes(q));
    return titleMatch || topicMatch || tagMatch;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <History className="w-5 h-5" />
            <h1 className="text-xl font-bold text-slate-100">Journal Session History</h1>
          </div>
          <p className="text-xs text-slate-400">
            Strictly isolated for Firebase UID: <span className="font-mono text-cyan-400">{currentUser?.uid}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter entries or tags..."
              className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs"
            />
          </div>
          
          <button
            onClick={fetchSessions}
            className="p-2 rounded-xl glass-card text-slate-400 hover:text-slate-200"
            title="Refresh entries"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-500 space-x-2 text-xs font-mono">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading isolated Firestore journal entries...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">No Journal Entries Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? 'No entries match your search query.' : 'You have not saved any completed journal sessions under this authenticated UID yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredSessions.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectSession(s)}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-cyan-400 flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(s.created_at).toLocaleDateString()}</span>
                  </span>
                  {s.summary?.emotion_tone && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {s.summary.emotion_tone}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {s.title}
                </h3>

                {s.summary?.main_topic && (
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {s.summary.main_topic}
                  </p>
                )}

                {/* Tags */}
                {s.tags && s.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {s.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  onClick={(e) => handleDeleteSession(e, s.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="p-2 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
