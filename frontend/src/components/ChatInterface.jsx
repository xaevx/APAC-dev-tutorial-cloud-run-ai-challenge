import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../firebase/authContext';
import { apiFetch } from '../api/client';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  RefreshCw, 
  Lightbulb,
  Shield,
  MessageSquare
} from 'lucide-react';

const PRESET_PROMPTS = [
  {
    title: 'Career & Growth',
    prompt: 'I am evaluating my next major career transition and want to map out my core priorities.',
    icon: Lightbulb
  },
  {
    title: 'Daily Alignment',
    prompt: 'Help me prioritize my top 3 strategic goals for today and identify potential friction points.',
    icon: Sparkles
  },
  {
    title: 'Unpack a Doubt',
    prompt: 'I have an unresolved concern about a project direction. Can we unpack it step-by-step?',
    icon: BrainCircuit
  }
];

export default function ChatInterface({ onSessionCompleted }) {
  const { idToken, currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend || textToSend.trim() === '' || isThinking) return;

    setError(null);
    const userMsg = { role: 'user', content: textToSend.trim(), timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    if (!customText) setInputMessage('');
    setIsThinking(true);

    try {
      // Call secure backend chat API with Bearer token
      const data = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          history: updatedMessages.slice(0, -1), // previous turn history
          message: textToSend.trim()
        })
      }, idToken);

      const aiMsg = { 
        role: 'model', 
        content: data.response, 
        timestamp: data.timestamp || new Date().toISOString() 
      };

      setMessages([...updatedMessages, aiMsg]);
    } catch (err) {
      console.error('[ChatInterface Error]', err);
      setError(err.message || 'Failed to receive response from Gemini backend.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleCompleteSession = async () => {
    if (messages.length === 0 || isSummarizing) return;

    setIsSummarizing(true);
    setError(null);

    try {
      // Call backend session completion endpoint
      const data = await apiFetch('/api/sessions/complete', {
        method: 'POST',
        body: JSON.stringify({
          messages,
          title: messages[0]?.content ? messages[0].content.substring(0, 45) + '...' : 'Journal Session'
        })
      }, idToken);

      if (onSessionCompleted) {
        onSessionCompleted(data.session);
      }
    } catch (err) {
      console.error('[Summary Error]', err);
      setError('Failed to summarize session. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto p-2 sm:p-4">
      
      {/* Top Banner / Session Controller */}
      <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-slate-800 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-100">
              Active Gemini Reflective Session
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Secured for UID: {currentUser ? `${currentUser.uid.substring(0, 12)}...` : 'Unauthenticated'}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleCompleteSession}
            disabled={isSummarizing || isThinking}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {isSummarizing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{isSummarizing ? 'Summarizing...' : 'Save & Summarize Session'}</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-slate-200">Dismiss</button>
        </div>
      )}

      {/* Conversation Window */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 sm:px-4 py-2">
        
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl">
              <Sparkles className="w-8 h-8" />
            </div>
            
            <div className="max-w-md">
              <h2 className="text-xl font-bold text-slate-100 mb-2">What is on your mind today?</h2>
              <p className="text-xs text-slate-400">
                Engage in a private multi-turn reflective session. Gemini helps structure your thoughts, unpack decisions, and generate auto-summaries.
              </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl text-left">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(preset.prompt)}
                  className="glass-card p-4 rounded-xl border border-slate-800 text-left hover:border-cyan-500/40 transition-all group"
                >
                  <preset.icon className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xs font-semibold text-slate-200 mb-1">{preset.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{preset.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="text-[10px] text-slate-500 px-1 font-mono">
                {msg.role === 'user' ? 'You' : 'MindLoom Gemini'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-slate-50 rounded-tr-none shadow-lg shadow-cyan-950/30'
                    : 'glass-panel text-slate-200 rounded-tl-none border border-slate-800'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Gemini Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center space-x-3 p-4 glass-panel rounded-2xl rounded-tl-none border border-slate-800 max-w-xs animate-pulse">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono text-cyan-300">Gemini is synthesizing thoughts...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="mt-2 glass-panel p-3 rounded-2xl border border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message or thought..."
            disabled={isThinking}
            className="flex-1 glass-input py-3 px-4 rounded-xl text-sm placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isThinking}
            className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold transition-all disabled:opacity-40 shadow-lg shadow-cyan-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
