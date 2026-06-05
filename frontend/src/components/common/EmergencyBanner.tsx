import { Phone, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function EmergencyBanner() {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="mx-2 mb-20 glass-card border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-red-500/10 p-3 flex items-center justify-between rounded-xl">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-sos-primary">
            {t('emergency.banner')}
          </span>
        </div>
        <a
          href="tel:112"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors min-h-0"
        >
          <Phone className="w-4 h-4" />
          112
        </a>
      </div>
    </div>
  );
}
