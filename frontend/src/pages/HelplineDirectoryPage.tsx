import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Phone, Search, Filter, Clock } from 'lucide-react';
import api from '../lib/axios';
import type { Helpline } from '../types/helpline';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🔍' },
  { id: 'police', label: 'Police', icon: '👮' },
  { id: 'ambulance', label: 'Medical', icon: '🚑' },
  { id: 'fire', label: 'Fire', icon: '🔥' },
  { id: 'cybercrime', label: 'Cybercrime', icon: '💻' },
  { id: 'women', label: 'Women', icon: '👩' },
  { id: 'child', label: 'Child', icon: '👶' },
  { id: 'disaster', label: 'Disaster', icon: '🌊' },
  { id: 'mental_health', label: 'Mental Health', icon: '🧠' },
  { id: 'domestic_violence', label: 'Domestic Violence', icon: '🏠' },
  { id: 'missing_person', label: 'Missing Person', icon: '🔎' },
  { id: 'road_accident', label: 'Road Accident', icon: '🚗' },
  { id: 'railway', label: 'Railway', icon: '🚂' },
  { id: 'poison', label: 'Poison', icon: '☠️' },
  { id: 'senior', label: 'Senior Citizen', icon: '👴' },
  { id: 'general', label: 'General', icon: '📞' },
];

const CAT_COLORS: Record<string, { color: string; bg: string }> = {
  police: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  ambulance: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  fire: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  cybercrime: { color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
  women: { color: '#A855F7', bg: 'rgba(168,85,247,0.1)' },
  child: { color: '#F472B6', bg: 'rgba(244,114,182,0.1)' },
  disaster: { color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  mental_health: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  domestic_violence: { color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
  missing_person: { color: '#14B8A6', bg: 'rgba(20,184,166,0.1)' },
  road_accident: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  railway: { color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
  poison: { color: '#84CC16', bg: 'rgba(132,204,22,0.1)' },
  senior: { color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  general: { color: '#64748B', bg: 'rgba(100,116,139,0.1)' },
};

function HelplineCard({ helpline }: { helpline: Helpline }) {
  const { t } = useLanguage();
  const { color, bg } = CAT_COLORS[helpline.category] ?? CAT_COLORS.general;
  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card rounded-2xl p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform"
      style={{ borderColor: color + '30' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sos-primary text-base leading-snug">
              {helpline.localizedName || helpline.name}
            </h3>
            {helpline.isEmergency && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                🔴 {t('landing.helpline.emergency')}
              </span>
            )}
          </div>
          <p className="text-sm text-sos-muted mt-0.5">
            {t('agency.' + helpline.agency.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')) || helpline.agency}
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: bg, color }}
        >
          {CATEGORIES.find(c => c.id === helpline.category)?.icon}{' '}
          {t('categories.' + helpline.category)}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-sos-secondary leading-relaxed">
        {helpline.localizedDesc || helpline.description}
      </p>

      {/* Hours */}
      <div className="flex items-center gap-1.5 text-xs text-sos-muted">
        <Clock className="w-3.5 h-3.5" />
        <span>{helpline.hours}</span>
      </div>

      {/* Numbers */}
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <a
          href={`tel:${helpline.number}`}
          id={`call-${helpline.number}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white transition-transform active:scale-95"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 16px ${color}40` }}
        >
          <Phone className="w-4 h-4" />
          <span className="helpline-number text-lg">{helpline.number}</span>
        </a>
        {helpline.altNumbers?.map((num) => (
          <a
            key={num}
            href={`tel:${num}`}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold glass-button-outline"
          >
            <Phone className="w-3.5 h-3.5" />
            {num}
          </a>
        ))}
      </div>
    </m.div>
  );
}

export default function HelplineDirectoryPage() {
  const { t, language } = useLanguage();
  const { category: paramCategory } = useParams<{ category?: string }>();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(paramCategory || 'all');
  const [stateFilter, setStateFilter] = useState('national');

  const { data, isLoading, error } = useQuery({
    queryKey: ['helplines', language],
    queryFn: async () => {
      const res = await api.get('/helplines', { params: { lang: language, limit: 100 } });
      return res.data.data as Helpline[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((h) => {
      const matchCat = activeCategory === 'all' || h.category === activeCategory;
      const matchState = stateFilter === 'all' || (stateFilter === 'national' && (h.state === 'ALL' || h.state === 'national')) || h.state === stateFilter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        h.name.toLowerCase().includes(q) ||
        h.number.includes(q) ||
        h.agency.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q);
      return matchCat && matchState && matchSearch;
    });
  }, [data, activeCategory, stateFilter, search]);

  const emergency = useMemo(() => filtered.filter(h => h.isEmergency && h.priority <= 3), [filtered]);
  const regular = useMemo(() => filtered.filter(h => !h.isEmergency || h.priority > 3), [filtered]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="page-bg pt-20 pb-32">
        <div className="grid-pattern" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">

          {/* Page Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="heading-1 text-3xl md:text-4xl text-sos-primary mb-2">
              📞 {t('helplines.title')}
            </h1>
            <p className="text-sos-secondary">
              {t('helplines.subtitle')}
            </p>
          </m.div>

          {/* Search + Filter Bar */}
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 rounded-2xl mb-6 flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1 flex items-center gap-3 bg-sos-input rounded-xl px-4 py-2.5 border border-sos-border">
              <Search className="w-4 h-4 text-sos-muted flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('helplines.search')}
                className="flex-1 bg-transparent outline-none text-sos-primary placeholder-sos-muted text-sm"
                aria-label="Search helplines"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-sos-muted hover:text-sos-primary min-h-0">
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-sos-muted" />
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="bg-sos-input border border-sos-border text-sos-primary text-sm rounded-xl px-3 py-2.5 outline-none"
                aria-label="Filter by state"
              >
                <option value="national">{t('helplines.filter.national')}</option>
                <option value="all">{t('helplines.filter.allStates')}</option>
              </select>
            </div>
          </m.div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                id={`cat-tab-${cat.id}`}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all min-h-0 ${
                  activeCategory === cat.id
                    ? 'text-white shadow-lg'
                    : 'glass-card text-sos-secondary hover:text-sos-primary'
                }`}
                style={activeCategory === cat.id ? {
                  background: CAT_COLORS[cat.id]?.color || '#3B82F6',
                  boxShadow: `0 4px 16px ${CAT_COLORS[cat.id]?.color || '#3B82F6'}40`,
                } : {}}
              >
                <span>{cat.icon}</span>
                <span>{cat.id === 'all' ? t('categories.all') : t('categories.' + cat.id)}</span>
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-sos-muted">
              {t('helplines.showingCount').replace('{count}', filtered.length.toString())}
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-sos-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="glass-card p-6 rounded-2xl text-center text-sos-secondary">
              <p className="text-lg mb-2">⚠️ {t('common.error')}</p>
              <p className="text-sm">{(error as Error).message}</p>
            </div>
          )}

          {/* Emergency Numbers */}
          {emergency.length > 0 && (
            <section className="mb-8">
              <h2 className="heading-2 text-xl text-sos-primary mb-4 flex items-center gap-2">
                🔴 {t('helplines.emergency')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {emergency.map((h) => (
                  <HelplineCard key={h._id} helpline={h} />
                ))}
              </div>
            </section>
          )}

          {/* Regular Helplines */}
          {regular.length > 0 && (
            <section>
              {emergency.length > 0 && (
                <h2 className="heading-2 text-xl text-sos-primary mb-4">{t('helplines.allHelplines')}</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {regular.map((h) => (
                  <HelplineCard key={h._id} helpline={h} />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-sos-primary mb-2">{t('helplines.noHelplines')}</h3>
              <p className="text-sos-secondary">{t('helplines.tryDifferent')}</p>
            </div>
          )}
        </div>
      </div>
    </LazyMotion>
  );
}
