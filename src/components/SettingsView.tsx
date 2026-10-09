import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WILAYAS_ALGERIA } from '../data/mockData';
import {
  Settings,
  Clock,
  Moon,
  Palette,
  User,
  School,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  LogOut,
  KeyRound,
  Mail,
  Building,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    user,
    updateUser,
    showToast,
    resetDemoData,
    isDemoMode,
    logoutTeacher,
    setShowAuthPortal,
    setShowAuthModal,
    setAuthView,
    license,
    setShowActivationModal,
    setShowCodeGeneratorModal,
    testSetTrialDaysRemaining,
  } = useApp();

  const [fullName, setFullName] = useState<string>(user.fullName);
  const [school, setSchool] = useState<string>(user.school);
  const [wilaya, setWilaya] = useState<string>(user.wilaya);
  const [dairaMunicipality, setDairaMunicipality] = useState<string>(user.dairaMunicipality || '');
  const [teacherRank, setTeacherRank] = useState<string>(user.teacherRank || 'أستاذ المدرسة الابتدائية');
  const [nationalTeacherId, setNationalTeacherId] = useState<string>(user.nationalTeacherId || '');
  const [academicYear, setAcademicYear] = useState<string>(user.academicYear);
  const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>(user.timeFormat);
  const [hijriOffset, setHijriOffset] = useState<number>(user.hijriOffset || 0);
  const [themeMode, setThemeMode] = useState(user.themeMode);
  const [showDesignerCredit, setShowDesignerCredit] = useState<boolean>(user.showDesignerCredit);
  const [showFooter, setShowFooter] = useState<boolean>(user.showFooter);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      fullName,
      school,
      wilaya,
      dairaMunicipality,
      teacherRank,
      nationalTeacherId,
      academicYear,
      timeFormat,
      hijriOffset,
      themeMode,
      showDesignerCredit,
      showFooter,
    });
    showToast('تم حفظ كافة إعدادات النظام وبيانات الأستاذ بنجاح');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <span>إعدادات النظام والحساب</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          تخصيص بيانات المعلم، الساعة، التقويم الهجري، والمظهر العام للتطبيق
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Teacher Profile */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              بيانات المعلم والمؤسسة التربوية
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                اسم ولقب الأستاذ:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                المدرسة الابتدائية:
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                الرتبة التربوية:
              </label>
              <select
                value={teacherRank}
                onChange={(e) => setTeacherRank(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="أستاذ المدرسة الابتدائية">أستاذ المدرسة الابتدائية</option>
                <option value="أستاذ رئيسي للتعليم الابتدائي">أستاذ رئيسي للتعليم الابتدائي</option>
                <option value="أستاذ مكون للتعليم الابتدائي">أستاذ مكون للتعليم الابتدائي</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                الولاية:
              </label>
              <select
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                {WILAYAS_ALGERIA.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                البلدية أو الدائرة:
              </label>
              <input
                type="text"
                value={dairaMunicipality}
                onChange={(e) => setDairaMunicipality(e.target.value)}
                placeholder="مثال: سطيف المركز"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                رقم التعريف المهني (اختياري):
              </label>
              <input
                type="text"
                value={nationalTeacherId}
                onChange={(e) => setNationalTeacherId(e.target.value)}
                placeholder="DZ-..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                السنة الدراسية:
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* 2. Date & Time Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              إعدادات الساعة والتقويم الهجري والميلادي
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                المنطقة الزمنية:
              </label>
              <input
                type="text"
                disabled
                value="توقيت الجزائر العاصمة (Africa/Algiers GMT+1)"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-3 py-2 text-slate-500 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                نظام عرض الوقت:
              </label>
              <select
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="24h">نظام 24 ساعة (مثال: 14:30)</option>
                <option value="12h">نظام 12 ساعة (مثال: 02:30 م)</option>
              </select>
            </div>

            {/* Hijri Adjustment Offset */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                <Moon className="w-4 h-4 text-amber-500" />
                <span>ضبط وتعديل الرؤية الهلالية للتقويم الهجري:</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                إذا كان اليوم الهجري الرسمي في منطقتك يختلف بيوم عن الحساب الفلكي، يمكنك تعديل الفارق:
              </p>
              <div className="flex items-center gap-2 pt-1">
                {[-2, -1, 0, 1, 2].map((offset) => (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => setHijriOffset(offset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      hijriOffset === offset
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {offset === 0 ? 'تلقائي (0)' : offset > 0 ? `+${offset} يوم` : `${offset} يوم`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Theme & Visual Preferences */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Palette className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              المظهر والهوية البصرية
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                الوضع العام:
              </label>
              <select
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="light">الوضع الفاتح (نهاري)</option>
                <option value="dark">الوضع الليلي (داكن)</option>
              </select>
            </div>

            {/* Designer attribution switch */}
            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={showDesignerCredit}
                  onChange={(e) => setShowDesignerCredit(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  إظهار بطاقة مصمم التطبيق (الأستاذ ديش صلاح الدين)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 4. Account & Authentication Management */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                حساب الأستاذ والأمان
              </h3>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {user.isDemoUser ? 'وضع الحساب التجريبي' : 'حساب أستاذ رسمي'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">البريد الإلكتروني:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                {user.email || 'غير مسجل'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">رقم التعريف المهني:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                {user.nationalTeacherId || 'DZ-2025-041982'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">حالة الخطة والترخيص:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${
                  license.isActivated
                    ? 'bg-emerald-500'
                    : license.trialDaysRemaining <= 0
                    ? 'bg-red-500 animate-ping'
                    : 'bg-amber-500'
                }`} />
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {license.isActivated
                    ? 'مفعل (ترخيص كامل)'
                    : license.trialDaysRemaining <= 0
                    ? 'انتهت فترة التجربة'
                    : `تجربة مجانية (متبقي ${license.trialDaysRemaining} د)`}
                </span>
              </div>
            </div>
          </div>

          {/* License Quick Action Bar */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200 block text-xs">
                {license.isActivated
                  ? 'ترخيص المنصة مفعل وصالح'
                  : 'الخطة المجانية محددة بـ 10 أيام'}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5">
                {license.isActivated
                  ? `الكود: ${license.activationCode || 'DICHE-2026-VIP'}`
                  : 'لتفعيل الحساب بشكل دائم تواصل مع الأستاذ ديش صلاح الدين للحصول على كود التفعيل.'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowActivationModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>تفعيل الحساب بالكود</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCodeGeneratorModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                title="لوحة توليد الأكواد للأشخاص (خاصة بالأستاذ ديش صلاح الدين)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>مولد الأكواد (للمسؤول)</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAuthPortal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>فتح البوابة الرسمية للشاشة الكاملة</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthView('register');
                setShowAuthModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>إنشاء حساب أستاذ جديد</span>
            </button>

            <button
              type="button"
              onClick={logoutTeacher}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold text-red-600 dark:text-red-400 transition-colors ms-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {isDemoMode && (
            <button
              type="button"
              onClick={resetDemoData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <span>إعادة ضبط البيانات التجريبية</span>
            </button>
          )}

          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors ms-auto"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
};
