import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarCheck2,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { exportAttendanceLogToExcel } from '../utils/excel';

export const AttendanceView: React.FC<{ onOpenExportModal: () => void }> = ({ onOpenExportModal }) => {
  const {
    activeClass,
    classStudents,
    classAttendance,
    setStudentAttendance,
    markAllPresentForDate,
    showToast,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [period, setPeriod] = useState<'morning' | 'afternoon'>('morning');
  const [filterMode, setFilterMode] = useState<'today' | 'week' | 'month'>('today');

  if (!activeClass) return null;

  // Calculate stats for current class
  const totalDays = Math.max(1, new Set(classAttendance.map((a) => a.date)).size);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
            <span>سجل الحضور والغياب اليومي ({activeClass.name})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تسجيل سريع لحضور وغياب وتأخر التلاميذ مع إحصائيات دقيقة لكل تلميذ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => markAllPresentForDate(activeClass.id, selectedDate, period)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>تحديد الكل حاضر ✓</span>
          </button>

          <button
            onClick={() => {
              exportAttendanceLogToExcel(classStudents, classAttendance, activeClass.name);
              showToast('تم تصدير سجل الحضور إلى Excel');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* Date & Period Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-600 dark:text-slate-400">التاريخ:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 font-mono text-slate-900 dark:text-white"
          />
        </div>

        {/* Period Selector (صباحي / مسائي) */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            onClick={() => setPeriod('morning')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              period === 'morning'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            الفترة الصباحية (08:00 - 11:15)
          </button>
          <button
            onClick={() => setPeriod('afternoon')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              period === 'afternoon'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            الفترة المسائية (13:00 - 15:15)
          </button>
        </div>
      </div>

      {/* Roster & Quick Attendance Toggle List */}
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <table className="w-full text-xs text-right border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="p-3 w-14 text-center">الرقم</th>
              <th className="p-3">اللقب والاسم</th>
              <th className="p-3 text-center">حالة الحضور اليوم</th>
              <th className="p-3 text-center">مجموع الغيابات</th>
              <th className="p-3 text-center">مرات التأخر</th>
              <th className="p-3 text-center">نسبة الحضور التقديرية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {classStudents.map((student) => {
              const currentRecord = classAttendance.find(
                (a) =>
                  a.studentId === student.id &&
                  a.date === selectedDate &&
                  a.period === period
              );
              const status = currentRecord ? currentRecord.status : 'present';

              const allStudentRecords = classAttendance.filter(
                (a) => a.studentId === student.id
              );
              const absentCount = allStudentRecords.filter((a) => a.status === 'absent').length;
              const lateCount = allStudentRecords.filter((a) => a.status === 'late').length;
              const presentCount = allStudentRecords.filter((a) => a.status === 'present').length;
              const rate =
                allStudentRecords.length > 0
                  ? Math.round((presentCount / allStudentRecords.length) * 100)
                  : 100;

              return (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3 text-center font-mono font-bold text-slate-400">
                    {student.registrationNumber}
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {student.lastName} {student.firstName}
                  </td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <button
                        onClick={() =>
                          setStudentAttendance(student.id, selectedDate, 'present', period)
                        }
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          status === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        حاضر
                      </button>
                      <button
                        onClick={() =>
                          setStudentAttendance(student.id, selectedDate, 'absent', period)
                        }
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          status === 'absent'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        غائب
                      </button>
                      <button
                        onClick={() =>
                          setStudentAttendance(student.id, selectedDate, 'late', period)
                        }
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          status === 'late'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        متأخر
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold text-red-600">
                    {absentCount > 0 ? `${absentCount} أيام` : '—'}
                  </td>
                  <td className="p-3 text-center font-bold text-amber-600">
                    {lateCount > 0 ? `${lateCount} مرات` : '—'}
                  </td>
                  <td className="p-3 text-center font-bold font-mono text-emerald-600">
                    {rate}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
