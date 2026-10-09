import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  School,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Mail,
  Smartphone,
} from 'lucide-react';

export const AboutApp: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Brand Hero Card */}
      <div className="p-8 rounded-3xl bg-radial from-emerald-500/10 via-transparent to-transparent border border-emerald-500/20 text-center space-y-4">
        <img
          src="/icon.svg"
          alt="قسمي"
          className="w-16 h-16 rounded-2xl mx-auto shadow-md"
        />
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            قسمي
          </h2>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            مساعد معلم التعليم الابتدائي
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
            «كل ما يحتاجه معلم الابتدائي في مكان واحد — إدارة الأقسام، متابعة التلاميذ، إنشاء المذكرات والاختبارات، تحليل النتائج، الأنشطة والألعاب التعليمية وتقارير الأولياء بمساعدة الذكاء الاصطناعي.»
          </p>
        </div>
      </div>

      {/* Designer & Developer Spotlight */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              تصميم وتطوير المنصة
            </h3>
            <p className="text-xs text-slate-500">
              مبادرة تربوية وتكنولوجية نوعية لخدمة أساتذة التعليم الابتدائي
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">المصمم والمطور:</span>
            <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
              الأستاذ: ديش صلاح الدين
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            تم بناء هذا التطبيق انطلاقاً من الميدان التربوي الحقيقي للتعليم الابتدائي، لتلبية الحاجة اليومية للأستاذ في تنظيم القسم وإعداد الوثائق الرسمية، والمذكرات البيداغوجية، واستيراد وتصدير قوائم التلاميذ بكل سهولة وسرعة.
          </p>
        </div>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 w-fit">
            <School className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">خصوصية المنهاج الجزائري</h4>
          <p className="text-slate-500 leading-relaxed">
            مذكرات رسمية متوافقة مع منهاج الجيل الثاني المخفف ومقاربة الكفاءات ومناهج التعليم الابتدائي.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 w-fit">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">ذكاء اصطناعي مساعد</h4>
          <p className="text-slate-500 leading-relaxed">
            التعرف على القوائم من الصور (OCR)، توليد الاختبارات النموذجية، وتحليل تعثرات التلاميذ.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 w-fit">
            <Smartphone className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">تطبيق PWA قابل للتثبيت</h4>
          <p className="text-slate-500 leading-relaxed">
            يعمل بسلاسة فائقة على الهواتف والأجهزة اللوحية والحواسيب ويدعم العمل مع التخزين المحلي.
          </p>
        </div>
      </div>

      {/* Copyright line */}
      <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
        © {currentYear} قسمي — جميع الحقوق محفوظة · تصميم وتطوير الأستاذ: ديش صلاح الدين
      </div>
    </div>
  );
};
