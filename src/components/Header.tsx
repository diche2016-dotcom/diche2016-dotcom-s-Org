import React from 'react';
import { useApp } from '../context/AppContext';
import { LiveClockWidget } from './LiveClockWidget';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Menu,
  Moon,
  Sun,
  Globe,
  Plus,
  School,
  CheckCircle2,
  Sparkles,
  User,
  LogOut,
  RotateCcw,
  ShieldCheck,
  KeyRound,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenNewClassModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenNewClassModal }) => {
  const {
    user,
    updateUser,
    classes,
    activeClassId,
    setActiveClassId,
    isDemoMode,
    exitDemoMode,
    resetDemoData,
    setShowAuthModal,
    setShowAuthPortal,
    setAuthView,
    logoutTeacher,
    license,
    setShowActivationModal,
    setShowCodeGeneratorModal,
  } = useApp();

  const toggleTheme = () => {
    updateUser({ themeMode: user.themeMode === 'dark' ? 'light' : 'dark' });
  };

  const handleLangChange = (lang: 'ar' | 'fr' | 'en') => {
    updateUser({ language: lang });
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between no-print">
      {/* Left (or Right in RTL): Toggle & Active Class */}
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Class Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={activeClassId}
              onChange={(e) => {
                if (e.target.value === 'NEW_CLASS') {
                  onOpenNewClassModal();
                } else {
                  setActiveClassId(e.target.value);
                }
              }}
              className="appearance-none bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-semibold rounded-xl px-3 py-1.5 pe-8 cursor-pointer hover:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.studentCount} تلميذ)
                </option>
              ))}
              <option value="NEW_CLASS">+ إضافة قسم جديد...</option>
            </select>
          </div>

          <button
            onClick={onOpenNewClassModal}
            className="hidden sm:flex items-center justify-center p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
            title="إضافة قسم جديد"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center / Right: Live Clock & Action Tools */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Clock Widget */}
        <LiveClockWidget />

        {/* Demo Mode Badge */}
        {isDemoMode && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] font-medium text-amber-800 dark:text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>تجربة ببيانات نموذجية</span>
            <button
              onClick={resetDemoData}
              title="إعادة ضبط البيانات النموذجية"
              className="ms-1 hover:text-amber-950 dark:hover:text-amber-100 p-0.5 rounded"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* PWA Install Button */}
        <PWAInstallButton compact />

        {/* License & Trial status pill */}
        <button
          onClick={() => setShowActivationModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
            license.isActivated
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : license.trialDaysRemaining <= 0
              ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 animate-pulse'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
          }`}
          title="حالة ترخيص الحساب وتفعيل الكود"
        >
          {license.isActivated ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">حساب مفعل</span>
            </>
          ) : license.trialDaysRemaining <= 0 ? (
            <>
              <Lock className="w-3.5 h-3.5 text-red-600" />
              <span>انتهت التجربة</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>تجربة: {license.trialDaysRemaining} د</span>
            </>
          )}
        </button>

        {/* Language Switcher */}
        <div className="relative group">
          <button
            className="flex items-center gap-1 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
            title="تغيير اللغة"
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span className="uppercase">{user.language}</span>
          </button>
          <div className="absolute top-full end-0 mt-1 hidden group-hover:block w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-40">
            <button
              onClick={() => handleLangChange('ar')}
              className={`w-full text-right px-3 py-1.5 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between ${
                user.language === 'ar' ? 'text-emerald-600 font-bold' : ''
              }`}
            >
              <span>العربية</span>
              {user.language === 'ar' && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => handleLangChange('fr')}
              className={`w-full text-right px-3 py-1.5 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between ${
                user.language === 'fr' ? 'text-emerald-600 font-bold' : ''
              }`}
            >
              <span>Français</span>
              {user.language === 'fr' && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => handleLangChange('en')}
              className={`w-full text-right px-3 py-1.5 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between ${
                user.language === 'en' ? 'text-emerald-600 font-bold' : ''
              }`}
            >
              <span>English</span>
              {user.language === 'en' && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={user.themeMode === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
        >
          {user.themeMode === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Teacher Avatar & Profile Menu */}
        <div className="relative group ps-2 border-s border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setAuthView('login');
              setShowAuthModal(true);
            }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
            title="فضاء الحساب وتسجيل الدخول"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user.fullName ? user.fullName.substring(0, 2) : 'أستاذ'}
            </div>
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user.fullName}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                {user.school}
              </span>
            </div>
          </button>

          {/* Quick Dropdown Menu */}
          <div className="absolute top-full end-0 mt-1 hidden group-hover:block w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-40 text-xs">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-white">{user.fullName}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email || 'حساب تجريبي'}</p>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>{user.teacherRank || 'أستاذ المدرسة الابتدائية'}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowAuthPortal(true);
              }}
              className="w-full text-right px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-between font-bold"
            >
              <span>البوابة الرسمية (الشاشة الكاملة)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </button>

            <button
              onClick={() => {
                setAuthView('login');
                setShowAuthModal(true);
              }}
              className="w-full text-right px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 flex items-center justify-between font-semibold"
            >
              <span>تسجيل الدخول / تبديل الحساب</span>
              <User className="w-3.5 h-3.5 text-emerald-600" />
            </button>

            <button
              onClick={() => {
                setAuthView('register');
                setShowAuthModal(true);
              }}
              className="w-full text-right px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 flex items-center justify-between font-semibold"
            >
              <span>إنشاء حساب أستاذ جديد</span>
              <Plus className="w-3.5 h-3.5 text-blue-600" />
            </button>

            <button
              onClick={resetDemoData}
              className="w-full text-right px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-between font-semibold"
            >
              <span>إعادة ضبط البيانات التجريبية</span>
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            </button>

            <button
              onClick={() => {
                setShowActivationModal(true);
              }}
              className="w-full text-right px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center justify-between font-bold"
            >
              <span>تفعيل الحساب بالكود</span>
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            </button>

            <button
              onClick={() => {
                setShowCodeGeneratorModal(true);
              }}
              className="w-full text-right px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between font-bold"
            >
              <span>مولد الأكواد (لوحة المسؤول)</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            </button>

            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

            <button
              onClick={logoutTeacher}
              className="w-full text-right px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-between font-semibold"
            >
              <span>تسجيل الخروج</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
