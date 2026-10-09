import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  KeyRound,
  ShieldCheck,
  Phone,
  Mail,
  MessageCircle,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  X,
  ExternalLink,
  Lock,
  Calendar,
  Award,
} from 'lucide-react';
import { MASTER_CODES } from '../utils/license';

export const ActivationModal: React.FC = () => {
  const {
    showActivationModal,
    setShowActivationModal,
    setShowCodeGeneratorModal,
    license,
    user,
    activateAccountWithCode,
    testSetTrialDaysRemaining,
  } = useApp();

  const [enteredCode, setEnteredCode] = useState<string>('');
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!showActivationModal) return null;

  const isExpired = !license.isActivated && license.trialDaysRemaining <= 0;

  // Contact info for developer الأستاذ ديش صلاح الدين
  const developerEmail = 'diche2016@gmail.com';
  const developerPhone = '+213550000000'; // Standard Algerian developer contact placeholder

  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!enteredCode.trim()) {
      setErrorMsg('يرجى إدخال كود التفعيل');
      return;
    }

    setIsSubmitting(true);
    const result = activateAccountWithCode(enteredCode);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.message);
    } else {
      setEnteredCode('');
    }
  };

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContact(type);
    setTimeout(() => setCopiedContact(null), 2500);
  };

  const waMessage = encodeURIComponent(
    `السلام عليكم ورحمة الله،
معك الأستاذ(ة): ${user.fullName || 'أستاذ'}
المدرسة: ${user.school || 'المدرسة الابتدائية'} - ولاية: ${user.wilaya || 'الجزائر'}
أرغب في الحصول على كود تفعيل منصة «قسمي» لمساعد معلم التعليم الابتدائي.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className={`p-6 text-white relative ${
          isExpired
            ? 'bg-gradient-to-br from-amber-700 via-red-800 to-rose-950'
            : license.isActivated
            ? 'bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-950'
            : 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950'
        }`}>
          {/* Close button (only allow closing if not strictly expired or let user view contacts) */}
          <button
            onClick={() => setShowActivationModal(false)}
            className="absolute top-4 start-4 p-2 rounded-xl bg-black/20 hover:bg-black/35 text-white/80 hover:text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              {isExpired ? (
                <Lock className="w-6 h-6 text-amber-300" />
              ) : license.isActivated ? (
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              ) : (
                <KeyRound className="w-6 h-6 text-amber-300" />
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold tracking-wide uppercase">
                <span>قسمي — رخصة الاستخدام البيداغوجي</span>
              </div>
              <h3 className="text-lg font-black mt-1">
                {isExpired
                  ? 'انتهت الفترة التجريبية المجانية (10 أيام)'
                  : license.isActivated
                  ? 'حسابك مفعل بنجاح'
                  : 'تفعيل حساب الأستاذ الرسمي'}
              </h3>
            </div>
          </div>

          {/* Subtitle notice */}
          <p className="text-xs text-white/90 mt-3 leading-relaxed">
            {isExpired
              ? 'انتهت فترة الـ 10 أيام الممنوحة لتجربة التطبيق. لمواصلة الاستفادة من جميع الميزات (إدارة الأقسام، المذكرات، رصد العلامات، والتقارير)، يرجى التواصل لتفعيل حسابك.'
              : license.isActivated
              ? `حسابك مفعل بنوع: ${
                  license.licenseType === 'lifetime'
                    ? 'ترخيص دائم مدى الحياة'
                    : license.licenseType === 'annual'
                    ? 'ترخيص سنوي للموسم الدراسي 2025/2026'
                    : 'تمديد تجريبي'
                }`
              : `أنت تستخدم الخطة المجانية: متبقي لديك ${license.trialDaysRemaining} من أصل 10 أيام.`}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Active status confirmation */}
          {license.isActivated && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                  المنصة مفعلة بالكامل وجاهزة للاستخدام الدائم!
                </span>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block">
                  كود التفعيل المستخدم: <strong className="font-mono">{license.activationCode || 'DICHE-2026-VIP'}</strong>
                </span>
                {license.activatedAt && (
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                    تاريخ التفعيل: {new Date(license.activatedAt).toLocaleDateString('ar-DZ')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Code Input Form */}
          <form onSubmit={handleActivateSubmit} className="space-y-3">
            <div>
              <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1.5 flex items-center justify-between">
                <span>أدخل كود التفعيل الممنوح لك:</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  مثال: QSM-ANN-XXXX-YYYY-Z
                </span>
              </label>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={enteredCode}
                  onChange={(e) => {
                    setEnteredCode(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="QSM-ANN-...."
                  className="w-full uppercase font-mono tracking-wider font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 ps-10 pe-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              {errorMsg && (
                <div className="mt-2 text-red-600 dark:text-red-400 flex items-center gap-1.5 font-semibold text-[11px] animate-in fade-in">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-99 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>تأكيد وتفعيل الحساب الآن</span>
            </button>
          </form>

          {/* Contact Box with Developer (الأستاذ ديش صلاح الدين) */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">للحصول على كود التفعيل، يرجى التواصل مع:</span>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                  الأستاذ: ديش صلاح الدين (مطور المنصة)
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/20">
                متاح يومياً
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* WhatsApp direct chat */}
              <a
                href={`https://wa.me/213550000000?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>تواصل عبر واتساب (WhatsApp)</span>
              </a>

              {/* Email direct mailto */}
              <a
                href={`mailto:${developerEmail}?subject=${encodeURIComponent('طلب كود تفعيل منصة قسمي')}&body=${waMessage}`}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>مراسلة عبر البريد الإلكتروني</span>
              </a>
            </div>

            {/* Quick Copy Contact Details */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono">{developerEmail}</span>
              <button
                onClick={() => handleCopyText(developerEmail, 'email')}
                className="hover:text-emerald-600 font-semibold flex items-center gap-1"
              >
                {copiedContact === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedContact === 'email' ? 'تم النسخ' : 'نسخ البريد'}</span>
              </button>
            </div>
          </div>

          {/* Quick Testing Tools for Developer & Admin */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>أدوات إدارة التراخيص والتجربة:</span>
              <button
                type="button"
                onClick={() => {
                  setShowActivationModal(false);
                  setShowCodeGeneratorModal(true);
                }}
                className="text-emerald-600 hover:underline font-bold flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>فتح مولد الأكواد (للمسؤول)</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => testSetTrialDaysRemaining(0)}
                className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 font-semibold hover:bg-red-100"
                title="محاكاة انتهاء مدة الـ 10 أيام لتجربة شاشة القفل"
              >
                تجربة انتهاء الـ 10 أيام (0 متبقي)
              </button>
              <button
                type="button"
                onClick={() => testSetTrialDaysRemaining(10)}
                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold hover:bg-blue-100"
                title="إعادة ضبط التجربة إلى 10 أيام كاملة"
              >
                إعادة ضبط التجربة (10 أيام)
              </button>
              <button
                type="button"
                onClick={() => setEnteredCode('QASAMI-2026-VIP')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold hover:bg-amber-100"
                title="وضع كود الماستر التجريبي"
              >
                كود الماستر: QASAMI-2026-VIP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
