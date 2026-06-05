import { Link, useLocation } from 'react-router-dom';
import { Shield, Sun, Moon, Globe, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { LazyMotion, domAnimation, m } from 'framer-motion';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage, languages } = useLanguage();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/helplines', label: t('nav.helplines') },
    { path: '/procedures', label: t('nav.procedures') },
    { path: '/nearby', label: t('nav.nearby') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <LazyMotion features={domAnimation}>
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 min-h-0 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-sos-primary">
              SOS Nav
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-sans font-semibold uppercase tracking-wider transition-colors min-h-0 ${
                  isActive(link.path)
                    ? 'text-sos-accent bg-sos-subtle'
                    : 'text-sos-secondary hover:text-sos-accent hover:bg-sos-subtle'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2 py-2 rounded-lg hover:bg-sos-subtle transition-colors min-h-0"
                aria-label="Select language"
              >
                <Globe className="w-4 h-4 text-sos-secondary" />
                <span className="text-xs font-semibold text-sos-secondary hidden sm:block">
                  {languages[language as keyof typeof languages]?.nativeName || 'EN'}
                </span>
              </button>
              {langOpen && (
                <m.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 glass-card p-2 w-48 z-50"
                >
                  {Object.entries(languages).map(([code, lang]) => (
                    <button
                      key={code}
                      onClick={() => { setLanguage(code as keyof typeof languages); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors min-h-0 ${
                        language === code
                          ? 'bg-sos-subtle text-sos-accent font-semibold'
                          : 'text-sos-secondary hover:bg-sos-subtle'
                      }`}
                    >
                      {lang.nativeName} <span className="text-sos-muted ml-1">({lang.name})</span>
                    </button>
                  ))}
                </m.div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-sos-subtle transition-colors min-h-0"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <m.div
                key={theme}
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-sos-secondary" />
                ) : (
                  <Moon className="w-5 h-5 text-sos-secondary" />
                )}
              </m.div>
            </button>

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="min-h-0 min-w-0">
                  <img
                    src={user?.avatar || ''}
                    alt={user?.displayName || 'User'}
                    className="w-8 h-8 rounded-full border-2 border-sos-border"
                    width={32}
                    height={32}
                  />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-sos-subtle transition-colors min-h-0 hidden md:block"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4 text-sos-secondary" />
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="glass-button-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 min-h-0 hidden md:flex"
              >
                <User className="w-4 h-4" />
                {t('nav.login')}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-sos-subtle md:hidden min-h-0"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden glass-card mx-2 mb-4 p-4 rounded-xl"
          >
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'text-sos-accent bg-sos-subtle'
                    : 'text-sos-secondary hover:bg-sos-subtle'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/history" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-semibold text-sos-secondary hover:bg-sos-subtle">
                  {t('nav.history')}
                </Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-semibold text-sos-secondary hover:bg-sos-subtle">
                  {t('nav.profile')}
                </Link>
              </>
            ) : (
              <button onClick={login} className="w-full mt-2 glass-button-primary px-4 py-3 rounded-lg text-sm font-semibold">
                {t('nav.login')}
              </button>
            )}
          </m.div>
        )}
      </nav>
    </LazyMotion>
  );
}
