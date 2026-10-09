import React from 'react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { user, t } = useApp();
  const currentYear = new Date().getFullYear();

  if (!user.showFooter) return null;

  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs no-print">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
        {/* Designer Attribution */}
        <div className="flex items-center gap-2 font-medium">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">© {currentYear} قسمي</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">
            تصميم وتطوير الأستاذ: ديش صلاح الدين
          </span>
        </div>

        {/* Subtitle & Tagline */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>مساعد معلم التعليم الابتدائي</span>
          <span>·</span>
          <span>الجزائر</span>
        </div>
      </div>
    </footer>
  );
};
