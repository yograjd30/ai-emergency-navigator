import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LazyMotion, domAnimation, m, Variants } from 'framer-motion';
import {
  Shield, Phone, FileText, MapPin, Zap, Globe, Lock, ChevronRight,
  WifiOff, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  { id: 'police', icon: '👮', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
  { id: 'ambulance', icon: '🚑', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
  { id: 'cybercrime', icon: '💻', color: '#06B6D4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.25)' },
  { id: 'women', icon: '👩', color: '#A855F7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)' },
  { id: 'disaster', icon: '🌊', color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)' },
  { id: 'mental_health', icon: '🧠', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' },
  { id: 'fire', icon: '🔥', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
  { id: 'child', icon: '👶', color: '#F472B6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.25)' },
];

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'AI Triage in Seconds',
    desc: 'Describe your emergency in any language. Our AI instantly identifies what you need and surfaces the right contacts.',
    color: '#F59E0B',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: '10 Indian Languages',
    desc: 'Communicate in Hindi, Tamil, Telugu, Bengali, Marathi, and more. No language barrier in an emergency.',
    color: '#3B82F6',
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'Locate Nearby Services',
    desc: 'GPS-powered map shows the nearest hospital, police station, fire station, and pharmacy in real time.',
    color: '#10B981',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Step-by-Step Procedures',
    desc: 'Clear, verified instructions for filing FIRs, reporting cybercrime, applying for documents — and more.',
    color: '#8B5CF6',
  },
  {
    icon: <WifiOff className="w-6 h-6" />,
    title: 'Works Offline',
    desc: 'Core helpline numbers are cached for offline access. Emergency info when you need it most.',
    color: '#F97316',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Privacy First',
    desc: 'Your sessions are encrypted. Data is never sold. Login is optional — most features work anonymously.',
    color: '#EC4899',
  },
];

const QUICK_HELPLINES = [
  { name: 'Emergency', number: '112', color: '#EF4444', glow: 'rgba(239,68,68,0.3)' },
  { name: 'Police', number: '100', color: '#3B82F6', glow: 'rgba(59,130,246,0.3)' },
  { name: 'Ambulance', number: '108', color: '#10B981', glow: 'rgba(16,185,129,0.3)' },
  { name: 'Women', number: '181', color: '#A855F7', glow: 'rgba(168,85,247,0.3)' },
  { name: 'Cybercrime', number: '1930', color: '#06B6D4', glow: 'rgba(6,182,212,0.3)' },
  { name: 'Child', number: '1098', color: '#F472B6', glow: 'rgba(244,114,182,0.3)' },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
};

export default function Landing() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState('');

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      navigate('/chat', { state: { initialMessage: chatInput.trim() } });
    } else {
      navigate('/chat');
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="page-bg pt-16">
        {/* Decorative orbs */}
        <div className="floating-orb orb-blue" aria-hidden="true" />
        <div className="floating-orb orb-amber" aria-hidden="true" />
        <div className="floating-orb orb-green" aria-hidden="true" />
        <div className="grid-pattern" aria-hidden="true" />

        {/* ── HERO ── */}
        <section className="relative z-10 pt-20 pb-16 px-4 text-center max-w-5xl mx-auto">
          <m.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-semibold text-sos-secondary mb-8"
          >
            <span>🚨</span>
            <span>{t('app.badge')}</span>
          </m.div>

          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="heading-1 text-5xl md:text-7xl mb-6"
          >
            <span className="text-sos-primary">{t('hero.title1')}</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #06B6D4 100%)' }}
            >
              {t('hero.title2')}
            </span>
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sos-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t('hero.subtitle')}
          </m.p>

          {/* Hero Chat Input */}
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <form onSubmit={handleChatSubmit} className="glass-card p-2 flex items-center gap-3 rounded-2xl">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Describe your emergency in any language..."
                className="flex-1 bg-transparent outline-none px-4 py-3 text-sos-primary placeholder-sos-muted text-base"
                aria-label="Describe your emergency"
              />
              <button
                type="submit"
                id="hero-chat-submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-transform active:scale-95"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }}
              >
                <span className="hidden sm:block">Get Help</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
            <p className="text-sm text-sos-muted mt-3">
              {t('hero.features')}
            </p>
          </m.div>

          {/* CTA Buttons */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <Link
              to="/chat"
              id="hero-cta-primary"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white min-h-0"
              style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 4px 20px rgba(239,68,68,0.35)' }}
            >
              <Phone className="w-4 h-4" />
              {t('hero.cta.primary')}
            </Link>
            <Link
              to="/helplines"
              id="hero-cta-secondary"
              className="glass-button-primary flex items-center gap-2 px-6 py-3 rounded-xl font-bold min-h-0"
            >
              <FileText className="w-4 h-4" />
              {t('hero.cta.secondary')}
            </Link>
          </m.div>
        </section>

        {/* ── QUICK HELPLINES ── */}
        <section className="relative z-10 py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <m.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="heading-2 text-2xl text-center text-sos-primary mb-8"
            >
              🆘 Critical Helplines — Always Available
            </m.h2>
            <m.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
            >
              {QUICK_HELPLINES.map((h) => (
                <m.a
                  key={h.number}
                  href={`tel:${h.number}`}
                  variants={itemVariants}
                  id={`quick-call-${h.number}`}
                  className="glass-card flex flex-col items-center justify-center gap-2 p-4 rounded-2xl hover:scale-105 transition-transform cursor-pointer group"
                  style={{ borderColor: h.color + '40', boxShadow: `0 4px 20px ${h.glow}` }}
                >
                  <span className="helpline-number text-2xl font-bold" style={{ color: h.color }}>
                    {h.number}
                  </span>
                  <span className="text-xs font-semibold text-sos-secondary group-hover:text-sos-primary transition-colors">
                    {h.name}
                  </span>
                </m.a>
              ))}
            </m.div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <m.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="heading-2 text-3xl text-sos-primary mb-3">What kind of help do you need?</h2>
              <p className="text-sos-secondary">Select a category to get targeted assistance instantly</p>
            </m.div>
            <m.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {CATEGORIES.map((cat) => (
                <m.div key={cat.id} variants={itemVariants}>
                  <Link
                    to={`/chat?category=${cat.id}`}
                    id={`cat-${cat.id}`}
                    className="glass-card flex flex-col items-center gap-3 p-6 rounded-2xl hover:scale-105 transition-all group block"
                    style={{ background: cat.bg, borderColor: cat.border }}
                  >
                    <span className="text-3xl">{cat.icon}</span>
                    <div className="text-center">
                      <div className="font-bold text-sos-primary text-sm">{t(`categories.${cat.id}`)}</div>
                      <div className="text-xs text-sos-muted mt-1">{t(`category.desc.${cat.id}`)}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: cat.color }} />
                  </Link>
                </m.div>
              ))}
            </m.div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <m.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="heading-2 text-3xl text-sos-primary mb-3">
                Built for India's Emergencies
              </h2>
              <p className="text-sos-secondary max-w-2xl mx-auto">
                Every feature is designed around real-world emergency scenarios across urban and rural India.
              </p>
            </m.div>
            <m.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {FEATURES.map((f) => (
                <m.div
                  key={f.title}
                  variants={itemVariants}
                  className="glass-card p-6 rounded-2xl hover:scale-[1.02] transition-transform"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: f.color + '20', color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="heading-3 text-lg text-sos-primary mb-2">{f.title}</h3>
                  <p className="text-sos-secondary text-sm leading-relaxed">{f.desc}</p>
                </m.div>
              ))}
            </m.div>
          </div>
        </section>

        {/* ── TRUST STRIP ── */}
        <section className="relative z-10 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card p-6 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-sos-accent" />
                <span className="font-bold text-sos-primary text-sm">Verified &amp; Trusted</span>
              </div>
              <p className="text-sos-secondary text-sm mb-4">{t('trust.verified')}</p>
              <div className="flex flex-wrap justify-center gap-3 text-xs text-sos-muted font-medium">
                <span className="px-3 py-1.5 rounded-full glass-card">📞 {t('trust.count')}</span>
                <span className="px-3 py-1.5 rounded-full glass-card">🔒 Encrypted Sessions</span>
                <span className="px-3 py-1.5 rounded-full glass-card">🌐 Govt-Verified Data</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="relative z-10 py-20 px-4 text-center">
          <m.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto glass-card p-10 rounded-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(239,68,68,0.06))' }}
          >
            <div className="text-5xl mb-4">🆘</div>
            <h2 className="heading-2 text-3xl text-sos-primary mb-3">Emergency? Don't wait.</h2>
            <p className="text-sos-secondary mb-8">
              Every second counts. Our AI triage is available 24/7 — no login required.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="tel:112"
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg animate-pulse-emergency"
                style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 4px 24px rgba(239,68,68,0.4)' }}
              >
                <Phone className="w-5 h-5" />
                Call 112 Now
              </a>
              <Link
                to="/chat"
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold glass-button-primary text-lg"
              >
                <Zap className="w-5 h-5" />
                AI Emergency Help
              </Link>
            </div>
          </m.div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 text-center py-8 px-4 text-sos-muted text-xs border-t border-sos-border">
          <p>
            SOS Nav — Emergency Guidance for India &nbsp;|&nbsp;
            Data sourced from official government directories &nbsp;|&nbsp;
            Not a substitute for 112
          </p>
        </footer>
      </div>
    </LazyMotion>
  );
}
