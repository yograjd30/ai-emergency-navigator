import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import {
  Clock, Bookmark, BookmarkCheck, Trash2,
  MessageSquare, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import type { EmergencySession } from '../types/session';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const SEVERITY_CONFIG = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: '🔴' },
  urgent: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: '🟡' },
  standard: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: '🔵' },
  info: { color: '#06B6D4', bg: 'rgba(6,182,212,0.1)', icon: '⚪' },
};

function SessionCard({ session, onBookmark, onDelete }: {
  session: EmergencySession;
  onBookmark: () => void;
  onDelete: () => void;
}) {
  const sev = SEVERITY_CONFIG[session.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.standard;
  const dateStr = new Date(session.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card rounded-2xl p-5 hover:scale-[1.01] transition-transform"
      style={{ borderColor: sev.color + '30' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Severity + Category */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.color}30` }}
            >
              {sev.icon} {session.severity.toUpperCase()}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sos-input text-sos-secondary">
              {session.category.replace(/_/g, ' ')}
            </span>
            {session.resolved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-500">
                <CheckCircle className="w-3.5 h-3.5" /> Resolved
              </span>
            )}
          </div>

          {/* Message */}
          <p className="text-sm text-sos-primary font-medium line-clamp-2 mb-2">
            "{session.userMessage}"
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-sos-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {dateStr}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {session.conversation.length} messages
            </span>
            {session.location?.city && (
              <span>📍 {session.location.city}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={onBookmark}
            className="p-2 rounded-lg hover:bg-sos-input transition-colors min-h-0"
            aria-label={session.bookmarked ? 'Remove bookmark' : 'Bookmark session'}
            title={session.bookmarked ? 'Bookmarked' : 'Bookmark'}
          >
            {session.bookmarked
              ? <BookmarkCheck className="w-4 h-4 text-amber-500" />
              : <Bookmark className="w-4 h-4 text-sos-muted" />
            }
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors min-h-0"
            aria-label="Delete session"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-sos-muted hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Matched helplines preview */}
      {session.triageResult?.matchedHelplines?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-sos-border flex items-center gap-2 flex-wrap">
          <span className="text-xs text-sos-muted">Helplines:</span>
          {session.triageResult.matchedHelplines.slice(0, 3).map((h: any) => (
            <a
              key={h._id}
              href={`tel:${h.number}`}
              className="text-xs font-bold px-2 py-1 rounded-lg bg-sos-input text-sos-accent hover:bg-sos-border transition-colors min-h-0"
            >
              {h.number}
            </a>
          ))}
        </div>
      )}
    </m.div>
  );
}

export default function SessionHistory() {
  const { t } = useLanguage();
  const { isAuthenticated, login } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'bookmarked' | 'resolved'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', filter, page],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 12 };
      if (filter === 'bookmarked') params.bookmarked = true;
      if (filter === 'resolved') params.resolved = true;
      const res = await api.get('/sessions', { params });
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  const bookmarkMutation = useMutation({
    mutationFn: async ({ id, bookmarked }: { id: string; bookmarked: boolean }) => {
      await api.patch(`/sessions/${id}`, { bookmarked: !bookmarked });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sessions/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });

  const sessions: EmergencySession[] = data?.data?.sessions || [];
  const pagination = data?.data?.pagination;

  if (!isAuthenticated) {
    return (
      <div className="page-bg pt-20 min-h-screen flex items-center justify-center">
        <div className="glass-card p-10 rounded-2xl text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="heading-2 text-xl text-sos-primary mb-3">Login Required</h2>
          <p className="text-sos-secondary text-sm mb-6">
            Sign in with Google to access your session history across devices.
          </p>
          <button
            onClick={login}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold mx-auto min-h-0"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#2563EB)' }}
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="page-bg pt-20 pb-24 min-h-screen">
        <div className="grid-pattern" aria-hidden="true" />
        <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10">

          {/* Header */}
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="heading-1 text-3xl text-sos-primary mb-2">
              🕰️ {t('history.title')}
            </h1>
            <p className="text-sos-secondary">Your past emergency sessions and guidance history.</p>
          </m.div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-3 mb-6">
            {(['all', 'bookmarked', 'resolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                id={`filter-${f}`}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all min-h-0 ${
                  filter === f
                    ? 'bg-sos-accent text-white'
                    : 'glass-card text-sos-secondary hover:text-sos-primary'
                }`}
              >
                {f === 'all' ? 'All Sessions' : f === 'bookmarked' ? '🔖 Bookmarked' : '✅ Resolved'}
              </button>
            ))}
          </div>

          {/* Sessions List */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-sos-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-2xl p-12 text-center"
            >
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-sos-primary mb-2">No sessions yet</h3>
              <p className="text-sos-secondary text-sm mb-6">
                {t('history.empty')}
              </p>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold min-h-0"
                style={{ background: 'linear-gradient(135deg,#3B82F6,#2563EB)' }}
              >
                Start a Session
              </Link>
            </m.div>
          ) : (
            <>
              <div className="space-y-4">
                <AnimatePresence>
                  {sessions.map((session) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      onBookmark={() => bookmarkMutation.mutate({ id: session._id, bookmarked: session.bookmarked })}
                      onDelete={() => deleteMutation.mutate(session._id)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl glass-card text-sm font-semibold disabled:opacity-40 min-h-0"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-sos-muted">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 rounded-xl glass-card text-sm font-semibold disabled:opacity-40 min-h-0"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </LazyMotion>
  );
}
