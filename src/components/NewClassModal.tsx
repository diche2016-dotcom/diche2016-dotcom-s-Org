import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GraduationCap, X } from 'lucide-react';

interface NewClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewClassModal: React.FC<NewClassModalProps> = ({ isOpen, onClose }) => {
  const { addClass, user, showToast } = useApp();

  const [name, setName] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('السنة الرابعة ابتدائي');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('يرجى إدخال اسم القسم', 'error');
      return;
    }
    addClass({
      name: name.trim(),
      gradeLevel,
      academicYear: user.academicYear,
      school: user.school,
      studentCount: 0,
      notes: notes.trim(),
    });
    setName('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              إضافة قسم جديد
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: السنة الأولى ابتدائي - قسم أ"
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
              ملاحظات وتوجيهات خاصة بالقسم:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات حول طبيعة القسم أو الحصص..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
          >
            إنشاء القسم
          </button>
        </div>
      </form>
    </div>
  );
};
