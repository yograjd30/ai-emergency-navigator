import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, MicOff, Phone, FileText, MapPin,
  AlertTriangle, CheckCircle, ChevronRight, RefreshCw
} from 'lucide-react';
import api from '../lib/axios';
import type { TriageResponse, FollowUpResponse } from '../types/triage';
import type { Helpline } from '../types/helpline';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const SEVERITY_CONFIG = {
  critical: { label: 'CRITICAL', color: '#EF4444', glow: 'rgba(239,68,68,0.2)', icon: '🔴' },
  urgent: { label: 'URGENT', color: '#F59E0B', glow: 'rgba(245,158,11,0.2)', icon: '🟡' },
  standard: { label: 'STANDARD', color: '#3B82F6', glow: 'rgba(59,130,246,0.2)', icon: '🔵' },
  info: { label: 'INFO', color: '#06B6D4', glow: 'rgba(6,182,212,0.2)', icon: '⚪' },
};

export default function Chat() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preCategory = searchParams.get('category');
  const initialMessage = (location.state as { initialMessage?: string })?.initialMessage;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t('chat.welcome'),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState(initialMessage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [triage, setTriage] = useState<TriageResponse | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-submit if coming with initial message
  useEffect(() => {
    if (initialMessage) {
      const timer = setTimeout(() => sendMessage(initialMessage), 400);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const sr = new SpeechRecognition();
      sr.continuous = false;
      sr.interimResults = false;
      sr.lang = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';
      sr.onresult = (e: any) => {
        setInput(e.results[0][0].transcript);
        setIsRecording(false);
      };
      sr.onerror = () => setIsRecording(false);
      sr.onend = () => setIsRecording(false);
      setRecognition(sr);
    }
  }, [language]);

  const toggleRecording = () => {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    const newMsg: Message = {
      ...msg,
      id: Math.random().toString(36).substr(2),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMsg]);
    return newMsg.id;
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput('');
    setIsLoading(true);

    addMessage({ role: 'user', content: text });
    const typingId = addMessage({ role: 'assistant', content: '', isTyping: true });

    try {
      let response: TriageResponse | FollowUpResponse;

      if (!sessionId) {
        // First message → triage
        const res = await api.post('/triage', {
          message: text,
          language,
          category: preCategory || undefined,
        });
        response = res.data.data as TriageResponse;
        const triageRes = response as TriageResponse;
        setSessionId(triageRes.sessionId);
        setSessionToken(triageRes.sessionToken);
        setTriage(triageRes);

        // Build rich response text
        const sevConf = SEVERITY_CONFIG[triageRes.triageResult.severity];
        const actionsText = triageRes.immediateActions
          .slice(0, 3)
          .map((a, i) => `${i + 1}. ${a}`)
          .join('\n');
        const assistantText = `${sevConf.icon} **${t('severity.' + triageRes.triageResult.severity).toUpperCase()} — ${t('categories.' + triageRes.triageResult.category).toUpperCase()}**\n\n${t('triage.immediateSteps')}\n${actionsText}\n\n${t('triage.foundHelplines').replace('{count}', triageRes.helplines.length.toString())}\n\n${t('triage.followUpPrompt')}`;

        setMessages(prev =>
          prev.map(m => m.id === typingId ? { ...m, content: assistantText, isTyping: false } : m)
        );
      } else {
        // Follow-up message
        const res = await api.post(`/triage/${sessionId}/followup`, {
          sessionToken,
          message: text,
          language,
        });
        const followUp = res.data.data as FollowUpResponse;
        setMessages(prev =>
          prev.map(m => m.id === typingId ? { ...m, content: followUp.response, isTyping: false } : m)
        );
      }
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === typingId
            ? { ...m, content: t('chat.errorProcess'), isTyping: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, sessionId, sessionToken, language, preCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetSession = () => {
    setMessages([{ id: 'welcome', role: 'assistant', content: t('chat.welcome'), timestamp: new Date() }]);
    setSessionId(null);
    setSessionToken(null);
    setTriage(null);
    setInput('');
  };

  const sevConf = triage ? SEVERITY_CONFIG[triage.triageResult.severity] : null;

  return (
    <LazyMotion features={domAnimation}>
      <div className="page-bg pt-16 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full gap-0 md:gap-4 p-4 md:p-6">

          {/* ── LEFT: CHAT ── */}
          <div className="flex-1 flex flex-col glass-card overflow-hidden" style={{ minHeight: '70vh' }}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-sos-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-lg">🤖</span>
                </div>
                <div>
                  <h1 className="font-bold text-sos-primary text-base">{t('chat.title')}</h1>
                  <p className="text-xs text-sos-muted">{t('chat.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {triage && (
                  <span
                    className="severity-badge"
                    style={{
                      background: sevConf!.glow,
                      color: sevConf!.color,
                      border: `1px solid ${sevConf!.color}40`,
                    }}
                  >
                    {sevConf!.icon} {t('severity.' + triage.triageResult.severity).toUpperCase()}
                  </span>
                )}
                {sessionId && (
                  <button
                    onClick={resetSession}
                    className="p-2 rounded-lg hover:bg-sos-input transition-colors min-h-0"
                    aria-label={t('chat.newSession')}
                    title={t('chat.startNewSession')}
                  >
                    <RefreshCw className="w-4 h-4 text-sos-secondary" />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <m.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
                      {msg.isTyping ? (
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="w-2 h-2 rounded-full bg-sos-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-sos-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-sos-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content.split('**').map((part, i) =>
                            i % 2 === 1
                              ? <strong key={i} className="font-bold">{part}</strong>
                              : <span key={i}>{part}</span>
                          )}
                        </div>
                      )}
                      <div className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-blue-200' : 'text-sos-muted'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-sos-border">
              <form onSubmit={handleSubmit} className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('chat.placeholder')}
                  rows={1}
                  className="flex-1 bg-sos-input rounded-xl px-4 py-3 text-sos-primary placeholder-sos-muted text-sm outline-none resize-none border border-sos-border focus:border-sos-accent transition-colors"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  aria-label={t('chat.inputLabel')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-3 rounded-xl transition-colors min-h-0 ${isRecording ? 'bg-red-500 text-white' : 'bg-sos-input text-sos-secondary hover:text-sos-accent'}`}
                  aria-label={isRecording ? t('chat.recording') : t('chat.startVoiceInput')}
                  title={t('chat.voiceInput')}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  type="submit"
                  id="chat-send-btn"
                  disabled={isLoading || !input.trim()}
                  className="p-3 rounded-xl text-white transition-all min-h-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}
                  aria-label={t('chat.send')}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <p className="text-xs text-sos-muted mt-2 text-center">
                {t('chat.instruction')}
              </p>
            </div>
          </div>

          {/* ── RIGHT: TRIAGE PANEL ── */}
          <AnimatePresence>
            {triage && (
              <m.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                className="w-full md:w-80 lg:w-96 flex flex-col gap-4 mt-4 md:mt-0"
              >
                {/* Severity Card */}
                <div
                  className="glass-card p-5 rounded-2xl"
                  style={{ borderColor: sevConf!.color + '40', boxShadow: `0 8px 32px ${sevConf!.glow}` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{sevConf!.icon}</span>
                    <div>
                      <div className="text-xs text-sos-muted font-semibold uppercase tracking-wider">{t('triage.severity')}</div>
                      <div className="font-bold text-sos-primary" style={{ color: sevConf!.color }}>
                        {t('severity.' + triage.triageResult.severity).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-xs text-sos-muted">{t('triage.confidence')}</div>
                      <div className="font-bold text-sos-primary">
                        {Math.round(triage.triageResult.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-sos-secondary capitalize">
                    {t('triage.category')}: {t('categories.' + triage.triageResult.category)}
                  </div>
                </div>

                {/* Immediate Actions */}
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="font-bold text-sos-primary mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    {t('triage.actions')}
                  </h3>
                  <ul className="space-y-2">
                    {triage.immediateActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-sos-secondary">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Helplines */}
                {triage.helplines.length > 0 && (
                  <div className="glass-card p-5 rounded-2xl">
                    <h3 className="font-bold text-sos-primary mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-sos-accent" />
                      {t('triage.helplines')}
                    </h3>
                    <div className="space-y-3">
                      {triage.helplines.slice(0, 6).map((h: Helpline) => (
                        <a
                          key={h._id}
                          href={`tel:${h.number}`}
                          id={`triage-call-${h.number}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-sos-input hover:bg-sos-border transition-colors group"
                        >
                          <div>
                            <div className="text-sm font-bold text-sos-primary">{h.localizedName || h.name}</div>
                            <div className="text-xs text-sos-muted">{h.agency}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="helpline-number text-lg font-bold text-sos-accent">{h.number}</span>
                            <Phone className="w-4 h-4 text-sos-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </a>
                      ))}
                    </div>
                    <Link
                      to="/helplines"
                      className="flex items-center justify-center gap-2 mt-4 text-sm text-sos-accent font-semibold hover:underline"
                    >
                      {t('chat.viewAllHelplines')} <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/procedures"
                    className="glass-card p-4 rounded-xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <FileText className="w-5 h-5 text-sos-accent" />
                    <span className="text-xs font-semibold text-sos-secondary text-center">{t('triage.procedures')}</span>
                  </Link>
                  <Link
                    to="/nearby"
                    className="glass-card p-4 rounded-xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <MapPin className="w-5 h-5 text-green-500" />
                    <span className="text-xs font-semibold text-sos-secondary text-center">{t('triage.nearby')}</span>
                  </Link>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </LazyMotion>
  );
}
