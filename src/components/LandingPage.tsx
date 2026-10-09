import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  Camera,
  BookOpen,
  FileText,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  GraduationCap,
  Download,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface LandingPageProps {
  onStart: () => void;
  onTryDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onTryDemo }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/icon.svg" alt="قسمي" className="w-8 h-8 rounded-xl shadow-xs" />
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              قسمي
            </h1>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              مساعد معلم الابتدائي
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PWAInstallButton compact />
          <button
            onClick={onTryDemo}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            جرّب التطبيق
          </button>
          <button
            onClick={onStart}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            ابدأ مجاناً
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-28 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>خطة مجانية كاملة لمدة 10 أيام لجميع أساتذة التعليم الابتدائي في الجزائر</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
          قسمي — كل ما يحتاجه معلم الابتدائي في مكان واحد
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          إدارة القسم، متابعة التلاميذ، إنشاء المذكرات والاختبارات، تحليل النتائج، الأنشطة والألعاب التعليمية وتقارير الأولياء بمساعدة الذكاء الاصطناعي.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>ابدأ الآن (10 أيام تجربة مجانية)</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onTryDemo}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>جرّب التطبيق (بيانات واقعية فورية)</span>
          </button>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="px-6 py-12 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            استيراد القوائم بذكاء فائق
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            رفع ملفات Excel أو مسح القوائم الورقية بالصورة والكاميرا (OCR) مع كشف التكرار وتصحيح الأعمدة تلقائياً.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            مذكرات واختبارات المنهاج الجزائري
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            صياغة مذكرات وفق منهاج الجيل الثاني المخفف، توليد مواضيع اختبارات مع التصحيح النموذجي، وتصدير Word وPDF.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            ساعة جزائرية وتقويم هجري وميلادي
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            توقيت حي مباشر للجزائر العاصمة مع حساب دقيق للتقويم الهجري وإمكانية ضبط فارق الرؤية الهلالية.
          </p>
        </div>
      </section>

      {/* Footer with Mandatory Designer Attribution */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 py-6 px-6 text-xs text-slate-500 text-center bg-white/50 dark:bg-slate-900/50">
        <p className="font-bold text-slate-800 dark:text-slate-200">
          © {currentYear} قسمي — تصميم وتطوير الأستاذ: ديش صلاح الدين
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          مساعد معلم التعليم الابتدائي · كل ما يحتاجه معلم الابتدائي في مكان واحد
        </p>
      </footer>
    </div>
  );
};
