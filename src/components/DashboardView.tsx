import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  GraduationCap,
  CalendarCheck2,
  LineChart,
  BookOpen,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Mail,
  Gamepad2,
  Clock,
  School,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenImportModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenImportModal,
}) => {
  const {
    user,
    classes,
    students,
    attendance,
    grades,
    lessonPlans,
    events,
    activeClass,
    isDemoMode,
  } = useApp();

  // Metrics
  const totalClassesCount = classes.length;
  const totalStudentsCount = students.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter((a) => a.date === todayStr);
  const presentToday = todayRecords.filter((a) => a.status === 'present').length;
  const attendanceRate =
    todayRecords.length > 0 ? Math.round((presentToday / todayRecords.length) * 100) : 96;

  const allScores = grades.map((g) => g.score);
  const overallAvg =
    allScores.length > 0
      ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2)
      : '8.45';

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-emerald-100">
              <School className="w-3.5 h-3.5" />
              <span>{user.school} · {user.wilaya}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              مرحباً بك، الأستاذ {user.fullName}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              «كل ما يحتاجه معلم الابتدائي في مكان واحد» — إدارة الأقسام، متابعة التلاميذ، المذكرات والاختبارات بمساعدة الذكاء الاصطناعي.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-emerald-900 font-bold text-xs shadow-md hover:bg-emerald-50 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>استيراد قائمة التلاميذ</span>
            </button>
            <button
              onClick={() => onNavigateTab('ai_assistant')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/40 hover:bg-emerald-600/60 border border-emerald-400/30 text-white font-bold text-xs transition-colors backdrop-blur-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>مساعدي الذكي</span>
            </button>
          </div>
        </div>

        {/* Decorative background geometry */}
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-emerald-600/20 blur-2xl pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-teal-500/20 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div
          onClick={() => onNavigateTab('classes')}
          className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">عدد الأقسام</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
            {totalClassesCount}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">السنة الدراسية {user.academicYear}</span>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => onNavigateTab('students')}
          className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/50 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجمالي التلاميذ</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
            {totalStudentsCount}
          </div>
          <span className="text-[11px] text-blue-600 font-medium">موزعون على {totalClassesCount} أقسام</span>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/50 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">نسبة الحضور اليوم</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-600 tabular-nums">
            {attendanceRate}%
          </div>
          <span className="text-[11px] text-slate-400 font-medium">مواظبة ممتازة في القسم</span>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onNavigateTab('grades')}
          className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-500/50 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">متوسط النتائج العام</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <LineChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-purple-600 tabular-nums">
            {overallAvg} <span className="text-xs font-normal text-slate-400">/ 10</span>
          </div>
          <span className="text-[11px] text-purple-600 font-medium">نتائج متقدمة وثابتة</span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
          روابط وإجراءات سريعة:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs font-bold">
          <button
            onClick={() => onNavigateTab('students')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <Users className="w-5 h-5 text-emerald-600" />
            <span>إضافة تلميذ</span>
          </button>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <CalendarCheck2 className="w-5 h-5 text-blue-600" />
            <span>تسجيل الحضور</span>
          </button>
          <button
            onClick={() => onNavigateTab('grades')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <LineChart className="w-5 h-5 text-purple-600" />
            <span>إدخال نتيجة</span>
          </button>
          <button
            onClick={() => onNavigateTab('lesson_plans')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-teal-600" />
            <span>تصميم مذكرة</span>
          </button>
          <button
            onClick={() => onNavigateTab('exams')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <FileText className="w-5 h-5 text-amber-600" />
            <span>توليد اختبار</span>
          </button>
          <button
            onClick={() => onNavigateTab('wheel')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-pink-600" />
            <span>عجلة الحظ</span>
          </button>
          <button
            onClick={() => onNavigateTab('parent_reports')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <Mail className="w-5 h-5 text-indigo-600" />
            <span>تقرير الولي</span>
          </button>
        </div>
      </div>

      {/* Two Column Grid: Recent Lesson Plans & Calendar Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Lesson Plans */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>آخر المذكرات التربوية المنشأة</span>
            </h4>
            <button
              onClick={() => onNavigateTab('lesson_plans')}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              عرض الكل →
            </button>
          </div>

          <div className="space-y-2">
            {lessonPlans.slice(0, 3).map((plan) => (
              <div
                key={plan.id}
                onClick={() => onNavigateTab('lesson_plans')}
                className="cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{plan.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {plan.gradeLevel} · {plan.subject}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-slate-400">{plan.createdAt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Calendar Reminders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>تنبيهات ومواعيد تربوية قادمة</span>
            </h4>
            <button
              onClick={() => onNavigateTab('planning')}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              التقويم الكامل →
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ev.type === 'exam' ? 'bg-purple-500' : 'bg-emerald-500'
                    }`}
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{ev.title}</p>
                    <p className="text-[11px] text-slate-400">{ev.time || 'صباحاً'}</p>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-slate-500">{ev.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
