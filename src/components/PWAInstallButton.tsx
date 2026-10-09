import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { currentLanguage } = useApp();

  const isAr = currentLanguage === 'ar';
  const isFr = currentLanguage === 'fr';

  if (isInstalled) {
    return null;
  }

  const label = isAr ? 'تثبيت التطبيق' : isFr ? 'Installer l’App' : 'Install App';

  if (isInstallable) {
    return (
      <button
        onClick={install}
        title={label}
        className={`flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-xs'
        }`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title={label}
          className={`flex items-center gap-1.5 rounded-lg border border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-medium transition-colors ${
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  {isAr ? 'تثبيت قسمي على iPhone / iPad' : 'Installer sur iOS'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                {isAr ? (
                  <>
                    <span>1. اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari بالأسفل.</span>
                    <br />
                    <span>2. مرر للأسفل واختر <strong>«إضافة إلى الشاشة الرئيسية» (Add to Home Screen)</strong>.</span>
                    <br />
                    <span>3. اضغط «إضافة» وسيظهر تطبيق «قسمي» كأيقونة على هاتفك.</span>
                  </>
                ) : (
                  <>
                    <span>1. Appuyez sur le bouton <strong>Partager</strong> dans Safari.</span>
                    <br />
                    <span>2. Faites défiler et appuyez sur <strong>« Sur l'écran d'accueil »</strong>.</span>
                  </>
                )}
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 text-sm font-semibold text-white transition-colors"
              >
                {isAr ? 'فهمت، حسناً' : 'Compris'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
