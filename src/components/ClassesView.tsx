import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClassRoom } from '../types';
import {
  GraduationCap,
  Users,
  Plus,
  Edit2,
  Trash2,
  CalendarCheck,
  LineChart,
  FileSpreadsheet,
  Download,
  ArrowRight,
  BookOpen,
  School,
} from 'lucide-react';

interface ClassesViewProps {
  onSelectClassAndTab: (classId: string, tab: string) => void;
  onOpenImportModalForClass: (classId: string) => void;
  onOpenExportModalForClass: (classId: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  onSelectClassAndTab,
  onOpenImportModalForClass,
  onOpenExportModalForClass,
}) => {
  const {
    classes,
    addClass,
    updateClass,
    deleteClass,
    students,
    attendance,
    grades,
    user,
    showToast,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  const [className, setClassName] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('السنة الرابعة ابتدائي');
  const [classNotes, setClassNotes] = useState<string>('');

  const handleOpenAdd = () => {
    setClassName('');
    setGradeLevel('السنة الرابعة ابتدائي');
    setClassNotes('');
    setEditingClass(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (cls: ClassRoom) => {
    setClassName(cls.name);
    setGradeLevel(cls.gradeLevel);
    setClassNotes(cls.notes || '');
    setEditingClass(cls);
    setShowAddModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      showToast('يرجى إدخال اسم القسم', 'error');
      return;
    }

    if (editingClass) {
      updateClass(editingClass.id, {
        name: className.trim(),
        gradeLevel,
        notes: classNotes,
      });
    } else {
      addClass({
        name: className.trim(),
        gradeLevel,
        academicYear: user.academicYear,
        school: user.school,
        studentCount: 0,
        notes: classNotes,
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <span>إدارة أقسامي التربوية ({classes.length} أقسام)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            لوحة معلومات خاصة بكل قسم لمتابعة التلاميذ والحضور وكشوف النقاط
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const classPupils = students.filter((s) => s.classId === cls.id);
          const boys = classPupils.filter((s) => s.gender === 'M').length;
          const girls = classPupils.filter((s) => s.gender === 'F').length;

          return (
            <div
              key={cls.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {cls.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">{cls.gradeLevel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {classes.length > 1 && (
                      <button
                        onClick={() => deleteClass(cls.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block">إجمالي التلاميذ:</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                      {classPupils.length} تلميذ
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block">التوزيع:</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {boys} ذكور · {girls} إناث
                    </span>
                  </div>
                </div>

                {cls.notes && (
                  <p className="text-[11px] text-slate-500 mt-3 italic line-clamp-2">
                    {cls.notes}
                  </p>
                )}
              </div>

              {/* Action shortcuts */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenImportModalForClass(cls.id)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="استيراد Excel لهذا القسم"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  </button>
                  <button
                    onClick={() => onOpenExportModalForClass(cls.id)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="تصدير Excel لهذا القسم"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectClassAndTab(cls.id, 'students')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 transition-colors"
                  >
                    التلاميذ
                  </button>
                  <button
                    onClick={() => onSelectClassAndTab(cls.id, 'attendance')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 transition-colors"
                  >
                    الحضور
                  </button>
                  <button
                    onClick={() => onSelectClassAndTab(cls.id, 'grades')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 transition-colors"
                  >
                    النتائج
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveClass}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingClass ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  اسم القسم (إلزامي):
                </label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="مثال: السنة الرابعة ابتدائي - قسم ب"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  المستوى الدراسي:
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option>السنة الأولى ابتدائي</option>
                  <option>السنة الثانية ابتدائي</option>
                  <option>السنة الثالثة ابتدائي</option>
                  <option>السنة الرابعة ابتدائي</option>
                  <option>السنة الخامسة ابتدائي</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  ملاحظات أو توجيهات خاصة:
                </label>
                <textarea
                  rows={2}
                  value={classNotes}
                  onChange={(e) => setClassNotes(e.target.value)}
                  placeholder="ملاحظات حول طبيعة القسم أو التوقيت..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                {editingClass ? 'حفظ التعديلات' : 'إضافة القسم'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
