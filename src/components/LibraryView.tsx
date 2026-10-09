import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FolderArchive,
  Search,
  BookOpen,
  FileText,
  Gamepad2,
  FileCheck,
  Download,
  Eye,
  Plus,
} from 'lucide-react';

export const LibraryView: React.FC = () => {
  const { libraryItems, lessonPlans, exams, showToast } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const allItems = [
    ...libraryItems,
    ...lessonPlans.map((p) => ({
      id: `lp-${p.id}`,
      title: `مذكرة: ${p.title}`,
      category: 'lesson_plan' as const,
      subject: p.subject,
      gradeLevel: p.gradeLevel,
      createdAt: p.createdAt,
      content: p,
    })),
    ...exams.map((e) => ({
      id: `ex-${e.id}`,
      title: `اختبار: ${e.examTitle} (${e.subject})`,
      category: 'exam' as const,
      subject: e.subject,
      gradeLevel: e.gradeLevel,
      createdAt: e.createdAt,
      content: e,
    })),
  ];

  const filtered = allItems.filter((item) => {
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.subject && item.subject.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-emerald-600" />
            <span>مكتبتي البيداغوجية الرقمية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            حفظ وأرشفة المذكرات، نماذج الاختبارات، الأنشطة، والوثائق الرسمية
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في الموارد والمذكرات..."
            className="w-full ps-9 pe-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              categoryFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            الكل ({allItems.length})
          </button>
          <button
            onClick={() => setCategoryFilter('lesson_plan')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              categoryFilter === 'lesson_plan'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            المذكرات
          </button>
          <button
            onClick={() => setCategoryFilter('exam')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              categoryFilter === 'exam'
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            الاختبارات
          </button>
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-500/50 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.category === 'lesson_plan'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}
                >
                  {item.category === 'lesson_plan' ? 'مذكرة تربوية' : 'نموذج اختبار'}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{item.createdAt}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {item.gradeLevel} · {item.subject}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">جاهز للتصدير والطباعة</span>
              <button
                onClick={() => showToast('المورد متاح وجاهز في قسم المذكرات أو الاختبارات')}
                className="flex items-center gap-1 font-bold text-emerald-600 hover:underline"
              >
                <span>معاينة</span>
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
