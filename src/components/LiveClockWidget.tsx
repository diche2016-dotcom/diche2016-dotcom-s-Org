import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getFormattedAlgeriaDateTime } from '../utils/datetime';
import { Clock, Calendar, Moon, Sparkles } from 'lucide-react';

export const LiveClockWidget: React.FC<{ compactMobile?: boolean }> = ({ compactMobile = false }) => {
  const { user } = useApp();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const info = getFormattedAlgeriaDateTime(
    currentDate,
    user.language,
    user.timeFormat,
    user.hijriOffset
  );

  return (
    <>
      {/* Main Widget */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="group relative cursor-pointer select-none rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 px-3.5 py-1.5 shadow-xs hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-all duration-200"
        title="توقيت الجزائر العاصمة والتقويم الميلادي والهجري"
      >
        <div className="flex items-center gap-2.5">
          {/* Animated Clock Icon */}
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Clock className="w-4 h-4 animate-[spin_60s_linear_infinite]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Time & Day Info */}
          <div className="flex flex-col text-right rtl:text-right ltr:text-left">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {info.time}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {info.dayName}
              </span>
            </div>

            {/* Dates Row */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400 inline" />
                {info.gregorianDate}
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Moon className="w-3 h-3 inline" />
                {info.hijriDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Modal Details for mobile or closer view */}
      {expanded && (
        <div
          onClick={() => setExpanded(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {user.language === 'ar' ? 'الوقت والتقويم' : 'Date & Heure'}
                  </h4>
                  <p className="text-xs text-slate-500">توقيت الجزائر العاصمة (Africa/Algiers GMT+1)</p>
                </div>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
              >
                إغلاق
              </button>
            </div>

            {/* Big Live Digital Clock */}
            <div className="text-center py-4 bg-radial from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20">
              <div className="text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                {info.time}
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
                {info.dayName}
              </div>
            </div>

            {/* Calendar details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  {user.language === 'ar' ? 'التاريخ الميلادي' : 'Date Grégorienne'}:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {info.gregorianDate}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-amber-500" />
                  {user.language === 'ar' ? 'التاريخ الهجري' : 'Date Hégirienne'}:
                </span>
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  {info.hijriDate}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              يمكنك ضبط فارق الرؤية الهلالية (± يوم) من صفحة الإعدادات
            </p>
          </div>
        </div>
      )}
    </>
  );
};
