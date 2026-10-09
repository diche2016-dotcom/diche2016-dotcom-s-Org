import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  KeyRound,
  AlertTriangle,
  Lock,
  MessageCircle,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const TrialBanner: React.FC = () => {
  const {
    license,
    isTrialExpired,
    setShowActivationModal,
    setShowCodeGeneratorModal,
    user,
  } = useApp();

  // If permanently activated, don't show the warning banner
  if (license.isActivated) {
    return null;
  }

  const isExpired = isTrialExpired;
  const daysLeft = license.trialDaysRemaining;

  const waMessage = encodeURIComponent(
    `السلام عليكم ورحمة الله،
معك الأستاذ(ة): ${user.fullName || 'أستاذ'}
انتهت فترة الـ 10 أيام التجريبية لتطبيق «قسمي»، أرغب في الحصول على كود تفعيل لحسابي.`
  );

  return (
    <div
      className={`w-full px-4 py-2 text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-2 border-b no-print transition-all ${
        isExpired
          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-700 text-white border-red-700 shadow-md animate-pulse'
          : daysLeft <= 3
          ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white border-amber-600 shadow-xs'
          : 'bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-emerald-100 border-emerald-700/60 shadow-xs'
      }`}
    >
      <div className="flex items-center gap-2.5 text-center sm:text-right">
        {isExpired ? (
          <Lock className="w-4 h-4 text-amber-200 shrink-0" />
        ) : (
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
        )}

        <div>
          {isExpired ? (
            <span>
              <strong>انتهت الفترة التجريبية المجانية (10 أيام) لحسابك!</strong> لمتابعة استخدام المنصة، يرجى إدخال كود التفعيل أو التواصل مع مصمم المنصة.
            </span>
          ) : (
            <span>
              <strong>الخطة التجريبية المجانية (10 أيام):</strong> متبقي لديك{' '}
              <span className="font-bold underline decoration-amber-300 decoration-2">
                {daysLeft} {daysLeft === 1 ? 'يوم واحد' : daysLeft === 2 ? 'يومان' : 'أيام'}
              </span>{' '}
              لتجربة جميع وظائف المنصة كاملة.
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* WhatsApp Direct Contact if Expired */}
        {isExpired && (
          <a
            href={`https://wa.me/213550000000?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>طلب الكود واتساب</span>
          </a>
        )}

        {/* Activate with Code button */}
        <button
          onClick={() => setShowActivationModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-[11px] shadow-xs transition-colors ${
            isExpired
              ? 'bg-white text-red-900 hover:bg-white/90 font-extrabold'
              : 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>تفعيل الحساب بالكود</span>
        </button>

        {/* Quick Generator link */}
        <button
          onClick={() => setShowCodeGeneratorModal(true)}
          className="p-1 rounded-lg bg-black/20 hover:bg-black/35 text-white/90 hover:text-white transition-colors"
          title="مولد الأكواد (لوحة المسؤول)"
        >
          <Award className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
