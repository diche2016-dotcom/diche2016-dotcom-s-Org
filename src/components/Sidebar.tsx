import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  LineChart,
  BookOpen,
  FileText,
  CalendarCheck2,
  Armchair,
  HelpCircle,
  Gamepad2,
  Mail,
  Calendar,
  FolderArchive,
  Bot,
  Settings,
  Info,
  X,
  Sparkles,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isOpen, onClose }) => {
  const { t, isDemoMode, setShowAuthPortal, license, setShowActivationModal } = useApp();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'classes', label: t('navClasses'), icon: GraduationCap },
    { id: 'students', label: t('navStudents'), icon: Users },
    { id: 'attendance', label: t('navAttendance'), icon: CalendarCheck2 },
    { id: 'grades', label: t('navGrades'), icon: LineChart },
    { id: 'lesson_plans', label: t('navLessonPlans'), icon: BookOpen },
    { id: 'exams', label: t('navExams'), icon: FileText },
    { id: 'wheel', label: t('navWheel'), icon: HelpCircle },
    { id: 'seating', label: t('navSeating'), icon: Armchair },
    { id: 'games', label: t('navGames'), icon: Gamepad2 },
    { id: 'parent_reports', label: t('navParentReports'), icon: Mail },
    { id: 'planning', label: t('navPlanning'), icon: Calendar },
    { id: 'library', label: t('navLibrary'), icon: FolderArchive },
    { id: 'ai_assistant', label: t('navAIAssistant'), icon: Bot, isAIBadge: true },
    { id: 'settings', label: t('navSettings'), icon: Settings },
    { id: 'about', label: t('navAbout'), icon: Info },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 start-0 z-40 w-64 bg-white dark:bg-slate-900 border-e border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 rtl:translate-x-full lg:rtl:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icon.svg" alt="قسمي" className="w-8 h-8 rounded-lg shadow-xs" />
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-none flex items-center gap-1.5">
                <span>قسمي</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  الابتدائي
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                مساعد معلم التعليم الابتدائي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.isAIBadge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      isActive
                        ? 'bg-emerald-700 text-emerald-100'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    ذكاء اصطناعي
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Official Portal button & Designer credit note */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
          {/* License & Trial Card */}
          <button
            onClick={() => {
              setShowActivationModal(true);
              onClose();
            }}
            className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-colors ${
              license.isActivated
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : license.trialDaysRemaining <= 0
                ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 animate-pulse'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>
                {license.isActivated
                  ? 'الترخيص: مفعل ✓'
                  : `تجربة مجانية: ${license.trialDaysRemaining} د`}
              </span>
            </div>
            <span className="text-[10px] underline">
              {license.isActivated ? 'التفاصيل' : 'كود التفعيل'}
            </span>
          </button>

          <button
            onClick={() => {
              setShowAuthPortal(true);
              onClose();
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            title="الانتقال إلى البوابة الرسمية لتسجيل الدخول"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>البوابة الرسمية للأستاذ</span>
            </div>
            <KeyRound className="w-3.5 h-3.5 text-emerald-600 opacity-80" />
          </button>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 text-right">
            <p className="text-[10px] text-slate-400 leading-tight">
              مصمم ومطور المنصة:
            </p>
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              الأستاذ: ديش صلاح الدين
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
