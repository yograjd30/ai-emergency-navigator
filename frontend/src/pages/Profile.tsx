import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import {
  User, Globe, Phone, Plus, Trash2, Moon, Sun,
  Shield, LogOut, Save, Eye
} from 'lucide-react';
import api from '../lib/axios';
import type { EmergencyContact } from '../types/user';
import { useLanguage, LangCode } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli','Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

export default function Profile() {
  const { t, language, setLanguage, languages } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, login, logout } = useAuth();
  const qc = useQueryClient();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [state, setState] = useState(user?.location?.state || '');
  const [city, setCity] = useState(user?.location?.city || '');
  const [contacts, setContacts] = useState<EmergencyContact[]>(user?.emergencyContacts || []);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });
  const [saved, setSaved] = useState(false);

  // Accessibility settings
  const [largeText, setLargeText] = useState(() => document.documentElement.classList.contains('large-text'));
  const [highContrast, setHighContrast] = useState(() => document.documentElement.classList.contains('high-contrast'));

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/users/profile', {
        displayName,
        location: { state, city },
        emergencyContacts: contacts,
        preferredLang: language,
      });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const toggleLargeText = () => {
    document.documentElement.classList.toggle('large-text');
    setLargeText(!largeText);
  };

  const toggleHighContrast = () => {
    document.documentElement.classList.toggle('high-contrast');
    setHighContrast(!highContrast);
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) return;
    setContacts(prev => [...prev, { ...newContact }]);
    setNewContact({ name: '', phone: '', relation: '' });
  };

  const removeContact = (idx: number) => {
    setContacts(prev => prev.filter((_, i) => i !== idx));
  };

  if (!isAuthenticated) {
    return (
      <div className="page-bg pt-20 min-h-screen flex items-center justify-center">
        <div className="glass-card p-10 rounded-2xl text-center max-w-sm">
          <div className="text-5xl mb-4">👤</div>
          <h2 className="heading-2 text-xl text-sos-primary mb-3">Sign in to view your profile</h2>
          <p className="text-sos-secondary text-sm mb-6">
            Save your preferences, emergency contacts, and session history.
          </p>
          <button
            onClick={login}
            id="profile-login-btn"
            className="flex items-center gap-3 px-6 py-3 rounded-xl text-white font-bold mx-auto min-h-0"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#2563EB)' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5c-.2 1.3-1 2.4-2.1 3.1v2.6h3.4c2-1.8 3-4.5 3-7.5z"/>
              <path fill="currentColor" d="M12 22c2.7 0 5-0.9 6.7-2.4l-3.4-2.6c-.9.6-2 1-3.3 1-2.6 0-4.8-1.7-5.6-4.1H2.9v2.7C4.6 19.8 8.1 22 12 22z"/>
              <path fill="currentColor" d="M6.4 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.4H2.9C2.3 8.6 2 10 2 12s.3 3.4.9 4.6l3.5-2.7z"/>
              <path fill="currentColor" d="M12 6c1.5 0 2.8.5 3.8 1.5L18.6 5C16.9 3.5 14.7 2.5 12 2.5 8.1 2.5 4.6 4.7 2.9 7.9l3.5 2.7C7.2 7.7 9.4 6 12 6z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="page-bg pt-20 pb-24 min-h-screen">
        <div className="grid-pattern" aria-hidden="true" />
        <div className="max-w-3xl mx-auto px-4 md:px-6 relative z-10 space-y-6">

          {/* Profile Header */}
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card rounded-2xl p-6 flex items-center gap-5">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.displayName}&background=3B82F6&color=fff`}
                alt="Profile avatar"
                className="w-20 h-20 rounded-full border-4 border-sos-border"
              />
              <div className="flex-1 min-w-0">
                <h1 className="heading-2 text-2xl text-sos-primary">{user?.displayName}</h1>
                <p className="text-sos-secondary text-sm">{user?.email}</p>
                <p className="text-sos-muted text-xs mt-1">
                  Member since {new Date(user?.createdAt || '').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 px-3 py-2 rounded-xl glass-button-outline text-sm font-semibold min-h-0"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">{t('nav.logout')}</span>
              </button>
            </div>
          </m.div>

          {/* Personal Info */}
          <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="heading-3 text-lg text-sos-primary flex items-center gap-2">
                <User className="w-5 h-5 text-sos-accent" />
                Personal Information
              </h2>
              <div>
                <label className="block text-xs font-semibold text-sos-muted mb-1.5 uppercase tracking-wider">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-sos-input border border-sos-border rounded-xl px-4 py-3 text-sos-primary outline-none focus:border-sos-accent transition-colors text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-sos-muted mb-1.5 uppercase tracking-wider">
                    State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-sos-input border border-sos-border rounded-xl px-4 py-3 text-sos-primary outline-none focus:border-sos-accent transition-colors text-sm"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-sos-muted mb-1.5 uppercase tracking-wider">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Your city"
                    className="w-full bg-sos-input border border-sos-border rounded-xl px-4 py-3 text-sos-primary placeholder-sos-muted outline-none focus:border-sos-accent transition-colors text-sm"
                  />
                </div>
              </div>
            </div>
          </m.div>

          {/* Language */}
          <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="glass-card rounded-2xl p-6">
              <h2 className="heading-3 text-lg text-sos-primary flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-sos-accent" />
                {t('profile.language')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(languages).map(([code, lang]) => (
                  <button
                    key={code}
                    onClick={() => setLanguage(code as LangCode)}
                    id={`lang-${code}`}
                    className={`flex flex-col items-start px-4 py-3 rounded-xl text-sm transition-all min-h-0 ${
                      language === code
                        ? 'bg-sos-accent text-white font-bold'
                        : 'glass-card text-sos-secondary hover:text-sos-primary'
                    }`}
                  >
                    <span className="font-bold">{lang.nativeName}</span>
                    <span className="text-xs opacity-70">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </m.div>

          {/* Emergency Contacts */}
          <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="glass-card rounded-2xl p-6">
              <h2 className="heading-3 text-lg text-sos-primary flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-sos-accent" />
                {t('profile.contacts')}
              </h2>

              <div className="space-y-3 mb-4">
                {contacts.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-sos-input">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-sos-primary">{c.name}</div>
                      <div className="text-xs text-sos-muted">{c.relation} · {c.phone}</div>
                    </div>
                    <a href={`tel:${c.phone}`} className="p-2 rounded-lg hover:bg-green-500/10 min-h-0">
                      <Phone className="w-4 h-4 text-green-500" />
                    </a>
                    <button
                      onClick={() => removeContact(i)}
                      className="p-2 rounded-lg hover:bg-red-500/10 min-h-0"
                      aria-label="Remove contact"
                    >
                      <Trash2 className="w-4 h-4 text-sos-muted hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Contact */}
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact(p => ({ ...p, name: e.target.value }))}
                  placeholder="Name"
                  className="bg-sos-input border border-sos-border rounded-xl px-3 py-2.5 text-sos-primary placeholder-sos-muted text-sm outline-none focus:border-sos-accent"
                />
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(p => ({ ...p, phone: e.target.value }))}
                  placeholder="Phone"
                  className="bg-sos-input border border-sos-border rounded-xl px-3 py-2.5 text-sos-primary placeholder-sos-muted text-sm outline-none focus:border-sos-accent"
                />
                <input
                  type="text"
                  value={newContact.relation}
                  onChange={(e) => setNewContact(p => ({ ...p, relation: e.target.value }))}
                  placeholder="Relation"
                  className="bg-sos-input border border-sos-border rounded-xl px-3 py-2.5 text-sos-primary placeholder-sos-muted text-sm outline-none focus:border-sos-accent"
                />
              </div>
              <button
                onClick={addContact}
                disabled={!newContact.name || !newContact.phone}
                className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold glass-button-primary disabled:opacity-40 min-h-0"
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </button>
            </div>
          </m.div>

          {/* Accessibility */}
          <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="heading-3 text-lg text-sos-primary flex items-center gap-2">
                <Eye className="w-5 h-5 text-sos-accent" />
                {t('profile.accessibility')}
              </h2>

              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-sos-input">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-sos-accent" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  <div>
                    <div className="font-semibold text-sm text-sos-primary">Dark Mode</div>
                    <div className="text-xs text-sos-muted">{theme === 'dark' ? 'Currently on' : 'Currently off'}</div>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full transition-colors relative min-h-0 ${theme === 'dark' ? 'bg-sos-accent' : 'bg-sos-border'}`}
                  role="switch"
                  aria-checked={theme === 'dark'}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Large Text */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-sos-input">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-sos-primary">A</span>
                  <div>
                    <div className="font-semibold text-sm text-sos-primary">Large Text</div>
                    <div className="text-xs text-sos-muted">Increases font size for readability</div>
                  </div>
                </div>
                <button
                  onClick={toggleLargeText}
                  className={`w-12 h-6 rounded-full transition-colors relative min-h-0 ${largeText ? 'bg-sos-accent' : 'bg-sos-border'}`}
                  role="switch"
                  aria-checked={largeText}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${largeText ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-sos-input">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-sos-accent" />
                  <div>
                    <div className="font-semibold text-sm text-sos-primary">High Contrast</div>
                    <div className="text-xs text-sos-muted">Enhanced contrast for visibility</div>
                  </div>
                </div>
                <button
                  onClick={toggleHighContrast}
                  className={`w-12 h-6 rounded-full transition-colors relative min-h-0 ${highContrast ? 'bg-sos-accent' : 'bg-sos-border'}`}
                  role="switch"
                  aria-checked={highContrast}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${highContrast ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </m.div>

          {/* Save Button */}
          <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              id="profile-save-btn"
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-60 min-h-0"
              style={{ background: saved ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#3B82F6,#2563EB)', boxShadow: '0 4px 20px rgba(59,130,246,0.35)' }}
            >
              {updateMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saved ? '✅ Saved!' : updateMutation.isPending ? 'Saving...' : t('common.save')}
            </button>
          </m.div>
        </div>
      </div>
    </LazyMotion>
  );
}
