import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, CheckCircle, Clock, FileText,
  ExternalLink, Wand2, BookOpen
} from 'lucide-react';
import api from '../lib/axios';
import type { Procedure, ProcedureStep } from '../types/procedure';
import { useLanguage } from '../context/LanguageContext';

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', color: '#10B981', icon: '🟢' },
  moderate: { label: 'Moderate', color: '#F59E0B', icon: '🟡' },
  complex: { label: 'Complex', color: '#EF4444', icon: '🔴' },
};

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'police', label: 'Police', icon: '👮' },
  { id: 'cybercrime', label: 'Cybercrime', icon: '💻' },
  { id: 'missing_person', label: 'Missing Person', icon: '🔎' },
  { id: 'ambulance', label: 'Medical', icon: '🚑' },
  { id: 'domestic_violence', label: 'Domestic Violence', icon: '🏠' },
  { id: 'disaster', label: 'Disaster', icon: '🌊' },
  { id: 'general', label: 'General', icon: '📝' },
];

function StepCard({ step, isCompleted, onToggle }: {
  step: ProcedureStep;
  isCompleted: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <m.div
      layout
      className={`glass-card rounded-xl overflow-hidden border-l-4 transition-all ${
        isCompleted ? 'opacity-70' : 'opacity-100'
      }`}
      style={{ borderLeftColor: isCompleted ? '#10B981' : '#3B82F6' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 p-4 text-left min-h-0"
      >
        {/* Step Number / Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors min-h-0 mt-0.5 ${
            isCompleted
              ? 'bg-green-500 text-white'
              : 'border-2 border-sos-border text-sos-muted hover:border-sos-accent'
          }`}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <span className="text-xs font-bold">{step.stepNumber}</span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-base ${isCompleted ? 'line-through text-sos-muted' : 'text-sos-primary'}`}>
            {step.title}
          </h3>
          {!expanded && (
            <p className="text-sm text-sos-secondary mt-1 line-clamp-2">{step.description}</p>
          )}
        </div>

        <div className="flex-shrink-0 text-sos-muted">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 ml-12 space-y-3">
              <p className="text-sm text-sos-secondary leading-relaxed">{step.description}</p>
              {step.tip && (
                <div className="flex items-start gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <span className="text-sm">💡</span>
                  <p className="text-sm text-sos-secondary">{step.tip}</p>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}

function ProcedureDetail({ procedure }: { procedure: Procedure }) {
  const { t, language } = useLanguage();
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const diffConf = DIFFICULTY_CONFIG[procedure.difficulty];
  const steps = procedure.steps;
  const progress = (completedSteps.size / steps.length) * 100;

  const toggleStep = (num: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const adaptMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/procedures/${procedure._id}/adapt`, { language });
      return res.data.data;
    },
  });

  return (
    <m.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-sos-input flex items-center justify-center text-2xl flex-shrink-0">
            📋
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="heading-2 text-xl text-sos-primary mb-2">
              {procedure.localizedTitle || procedure.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${diffConf.color}20`, color: diffConf.color, border: `1px solid ${diffConf.color}30` }}>
                {diffConf.icon} {diffConf.label}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-sos-muted">
                <Clock className="w-3.5 h-3.5" /> {procedure.timeEstimate}
              </span>
              <span className="text-xs text-sos-muted">
                {steps.length} steps
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-sos-muted mb-1.5">
            <span>Progress</span>
            <span>{completedSteps.size}/{steps.length} steps</span>
          </div>
          <div className="h-2 bg-sos-input rounded-full overflow-hidden">
            <m.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #3B82F6, #10B981)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
        </div>
      </div>

      {/* Required Documents */}
      {procedure.requiredDocs.length > 0 && (
        <div className="glass-card p-5 rounded-2xl">
          <h3 className="font-bold text-sos-primary mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sos-accent" />
            {t('procedures.docs')}
          </h3>
          <ul className="space-y-2">
            {procedure.requiredDocs.map((doc, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-sos-secondary">
                <CheckCircle className="w-3.5 h-3.5 text-sos-muted flex-shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sos-primary text-lg">{t('procedures.steps')}</h3>
          <button
            onClick={() => adaptMutation.mutate()}
            disabled={adaptMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold glass-button-primary min-h-0"
          >
            <Wand2 className="w-3.5 h-3.5" />
            {adaptMutation.isPending ? 'Adapting...' : t('procedures.adapt')}
          </button>
        </div>

        {/* Adapted steps */}
        {adaptMutation.isSuccess && (
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 rounded-xl mb-4 border border-sos-accent/30"
          >
            <div className="flex items-center gap-2 mb-2 text-sos-accent font-semibold text-sm">
              <Wand2 className="w-4 h-4" /> AI-Adapted Guidance
            </div>
            <p className="text-sm text-sos-secondary whitespace-pre-wrap">{adaptMutation.data}</p>
          </m.div>
        )}

        <div className="space-y-3">
          {steps.map((step) => (
            <StepCard
              key={step.stepNumber}
              step={step}
              isCompleted={completedSteps.has(step.stepNumber)}
              onToggle={() => toggleStep(step.stepNumber)}
            />
          ))}
        </div>
      </div>

      {/* Related Links */}
      {procedure.relatedLinks.length > 0 && (
        <div className="glass-card p-5 rounded-2xl">
          <h3 className="font-bold text-sos-primary mb-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-sos-accent" />
            Official Resources
          </h3>
          <div className="space-y-2">
            {procedure.relatedLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-sos-input hover:bg-sos-border transition-colors text-sm font-semibold text-sos-accent"
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </m.div>
  );
}

export default function ProcedurePage() {
  const { t, language } = useLanguage();
  const { id } = useParams<{ id?: string }>();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(id || null);

  const { data: procedures, isLoading } = useQuery({
    queryKey: ['procedures', language],
    queryFn: async () => {
      const res = await api.get('/procedures', { params: { lang: language } });
      return res.data.data as Procedure[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filtered = (procedures || []).filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      (p.localizedTitle || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const selectedProcedure = procedures?.find(p => p._id === selectedId);

  return (
    <LazyMotion features={domAnimation}>
      <div className="page-bg pt-20 pb-32 min-h-screen">
        <div className="grid-pattern" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">

          {/* Header */}
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="heading-1 text-3xl md:text-4xl text-sos-primary mb-2">
              📋 {t('procedures.title')}
            </h1>
            <p className="text-sos-secondary">
              Step-by-step verified guides for navigating emergency procedures in India.
            </p>
          </m.div>

          <div className="flex flex-col lg:flex-row gap-6">

            {/* LEFT: Procedures List */}
            <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
              {/* Search */}
              <div className="flex items-center gap-3 bg-sos-input rounded-xl px-4 py-2.5 border border-sos-border glass-card">
                <BookOpen className="w-4 h-4 text-sos-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search procedures..."
                  className="flex-1 bg-transparent outline-none text-sos-primary placeholder-sos-muted text-sm"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-0 ${
                      activeCategory === cat.id
                        ? 'bg-sos-accent text-white'
                        : 'glass-card text-sos-secondary hover:text-sos-primary'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>

              {/* Procedure List */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-sos-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((p) => {
                    const diff = DIFFICULTY_CONFIG[p.difficulty];
                    return (
                      <button
                        key={p._id}
                        onClick={() => setSelectedId(p._id)}
                        id={`proc-${p._id}`}
                        className={`w-full text-left p-4 rounded-xl transition-all glass-card min-h-0 ${
                          selectedId === p._id
                            ? 'border-sos-accent bg-sos-subtle'
                            : 'hover:border-sos-border'
                        }`}
                      >
                        <div className="font-semibold text-sm text-sos-primary leading-snug mb-1">
                          {p.localizedTitle || p.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-sos-muted">
                          <span style={{ color: diff.color }}>{diff.icon} {diff.label}</span>
                          <span>·</span>
                          <Clock className="w-3 h-3" />
                          <span>{p.timeEstimate}</span>
                        </div>
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="text-center py-8 text-sos-muted text-sm">
                      No procedures found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: Procedure Detail */}
            <div className="flex-1 min-w-0">
              {selectedProcedure ? (
                <ProcedureDetail procedure={selectedProcedure} />
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-xl font-bold text-sos-primary mb-2">Select a Procedure</h3>
                  <p className="text-sos-secondary text-sm max-w-sm mx-auto">
                    Choose a procedure from the left to view step-by-step guidance with progress tracking.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
