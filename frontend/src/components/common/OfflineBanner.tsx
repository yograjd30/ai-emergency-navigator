import { WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { t } = useLanguage();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 mx-4">
      <div className="glass-card border-amber-500/30 bg-amber-500/10 p-3 flex items-center justify-center gap-2 rounded-xl">
        <WifiOff className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
          {t('offline.banner')}
        </span>
      </div>
    </div>
  );
}
