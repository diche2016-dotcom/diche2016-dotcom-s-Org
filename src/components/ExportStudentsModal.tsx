import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  exportStudentsListToExcel,
  exportGradesMatrixToExcel,
  exportAttendanceLogToExcel,
  exportClassBackupToExcel,
} from '../utils/excel';
import {
  Download,
  FileSpreadsheet,
  CheckSquare,
  BarChart3,
  CalendarCheck,
  Archive,
  X,
  Check,
} from 'lucide-react';

interface ExportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudentIds?: string[];
}

export const ExportStudentsModal: React.FC<ExportStudentsModalProps> = ({
  isOpen,
  onClose,
  selectedStudentIds = [],
}) => {
  const {
    activeClass,
    classStudents,
    subjects,
    classAssessments,
    grades,
    classAttendance,
    user,
    showToast,
  } = useApp();

  const [exportType, setExportType] = useState<
    'all' | 'selected' | 'grades' | 'attendance' | 'backup'
  >('all');

  const [attendancePeriod, setAttendancePeriod] = useState<'today' | 'week' | 'month'>('month');

  if (!isOpen || !activeClass) return null;

  const handleExport = () => {
    try {
      if (exportType === 'all') {
        exportStudentsListToExcel(classStudents, activeClass.name, user.language);
        showToast('تم تصدير قائمة تلاميذ القسم إلى Excel');
      } else if (exportType === 'selected') {
        const filtered = classStudents.filter((s) => selectedStudentIds.includes(s.id));
        if (filtered.length === 0) {
          showToast('لم يتم تحديد أي تلاميذ للتصدير', 'error');
          return;
        }
        exportStudentsListToExcel(filtered, `${activeClass.name}_المحددون`, user.language);
        showToast(`تم تصدير ${filtered.length} تلميذاً إلى Excel`);
      } else if (exportType === 'grades') {
        exportGradesMatrixToExcel(
          classStudents,
          subjects,
          classAssessments,
          grades,
          activeClass.name
        );
        showToast('تم تصدير جدول نتائج القسم إلى Excel');
      } else if (exportType === 'attendance') {
        const periodTitle =
          attendancePeriod === 'today' ? 'اليوم' : attendancePeriod === 'week' ? 'هذا الأسبوع' : 'هذا الشهر';
        exportAttendanceLogToExcel(
          classStudents,
          classAttendance,
          activeClass.name,
          periodTitle
        );
        showToast('تم تصدير سجل الحضور والغياب إلى Excel');
      } else if (exportType === 'backup') {
        exportClassBackupToExcel(
          {
            classInfo: activeClass,
            students: classStudents,
            attendance: classAttendance,
            grades: grades,
          },
          activeClass.name
        );
        showToast('تم تنزيل النسخة الاحتياطية للقسم بنجاح');
      }
      onClose();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء التصدير', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                تصدير بيانات القسم إلى Excel
              </h3>
              <p className="text-xs text-slate-500">{activeClass.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Options */}
        <div className="space-y-2.5 text-xs">
          <label
            onClick={() => setExportType('all')}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
              exportType === 'all'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-600'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  تصدير جميع تلاميذ القسم ({classStudents.length} تلميذ)
                </p>
                <p className="text-[11px] text-slate-500">
                  ملف Excel منظم يحتوي على بيانات التسجيل والهواتف
                </p>
              </div>
            </div>
            {exportType === 'all' && <Check className="w-4 h-4 text-emerald-600" />}
          </label>

          {selectedStudentIds.length > 0 && (
            <label
              onClick={() => setExportType('selected')}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                exportType === 'selected'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-600'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    تصدير التلاميذ المحددين ({selectedStudentIds.length} تلميذ)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    تصدير التلاميذ الذين قمت باختيارهم يدوياً فقط
                  </p>
                </div>
              </div>
              {exportType === 'selected' && <Check className="w-4 h-4 text-emerald-600" />}
            </label>
          )}

          <label
            onClick={() => setExportType('grades')}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
              exportType === 'grades'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-600'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  تصدير جدول نتائج القسم والمعدلات
                </p>
                <p className="text-[11px] text-slate-500">
                  كشف علامات مفصل: المواد، العلامات، والمعدل العام
                </p>
              </div>
            </div>
            {exportType === 'grades' && <Check className="w-4 h-4 text-emerald-600" />}
          </label>

          <label
            onClick={() => setExportType('attendance')}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
              exportType === 'attendance'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-600'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CalendarCheck className="w-4 h-4 text-amber-600" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  تصدير سجل الحضور والغياب
                </p>
                <p className="text-[11px] text-slate-500">
                  إحصائيات الغيابات والتأخرات ونسب الحضور
                </p>
              </div>
            </div>
            {exportType === 'attendance' && <Check className="w-4 h-4 text-emerald-600" />}
          </label>

          <label
            onClick={() => setExportType('backup')}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
              exportType === 'backup'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-600'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Archive className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  نسخة احتياطية شاملة للقسم
                </p>
                <p className="text-[11px] text-slate-500">
                  ملف مصنف يحتوي على كافة التلاميذ، الحضور، والتقييمات
                </p>
              </div>
            </div>
            {exportType === 'backup' && <Check className="w-4 h-4 text-emerald-600" />}
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            إلغاء
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل ملف Excel (.xlsx)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
