import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LessonPlan } from '../types';
import {
  BookOpen,
  Sparkles,
  Download,
  Printer,
  Edit3,
  Check,
  RotateCcw,
  Plus,
  Loader2,
  FileText,
  FileCheck,
} from 'lucide-react';

export const LessonPlanner: React.FC = () => {
  const {
    lessonPlans,
    addLessonPlan,
    deleteLessonPlan,
    showToast,
    subjects,
    activeClass,
  } = useApp();

  const [activePlan, setActivePlan] = useState<LessonPlan | null>(lessonPlans[0] || null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Form Inputs
  const [subject, setSubject] = useState<string>('اللغة العربية');
  const [gradeLevel, setGradeLevel] = useState<string>(activeClass?.gradeLevel || 'السنة الرابعة ابتدائي');
  const [domain, setDomain] = useState<string>('فهم المكتوب وقواعد اللغة');
  const [section, setSection] = useState<string>('المقطع الأول: القيم الإنسانية');
  const [title, setTitle] = useState<string>('الجمع بالاحتفاظ للأعداد الطبيعية');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Trigger Gemini AI generation
  const handleGenerate = async () => {
    if (!title.trim()) {
      showToast('يرجى إدخال عنوان الدرس', 'error');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await fetch('/api/ai/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          gradeLevel,
          domain,
          section,
          title,
          customNotes,
        }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const newPlan: LessonPlan = {
        id: `plan-${Date.now()}`,
        subject,
        gradeLevel,
        domain,
        section,
        title,
        content: data,
        createdAt: new Date().toISOString().split('T')[0],
      };

      addLessonPlan(newPlan);
      setActivePlan(newPlan);
      showToast('تم تصميم المذكرة التربوية النموذجية بنجاح!');
    } catch (err: any) {
      showToast(err.message || 'فشل في توليد المذكرة', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export as Word Document (.doc / rich HTML format)
  const handleExportWord = () => {
    if (!activePlan) return;
    const content = activePlan.content;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${activePlan.title}</title>
        <style>
          body { font-family: 'Arial', 'Cairo', sans-serif; direction: rtl; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
          th, td { border: 1px solid #333; padding: 8px; text-align: right; }
          th { background-color: #f2f2f2; }
          .header-box { border: 2px solid #059669; padding: 10px; margin-bottom: 20px; }
          h1, h2, h3 { color: #059669; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h2 style="text-align: center;">الجمهورية الجزائرية الديمقراطية الشعبية</h2>
          <h3 style="text-align: center;">وزارة التربية الوطنية — مذكرة تربوية للتعليم الابتدائي</h3>
          <p><strong>المادة:</strong> ${activePlan.subject} | <strong>المستوى:</strong> ${activePlan.gradeLevel}</p>
          <p><strong>الميدان:</strong> ${activePlan.domain} | <strong>المقطع التعلمي:</strong> ${activePlan.section}</p>
          <p><strong>عنوان الدرس:</strong> ${activePlan.title}</p>
          <p><strong>مركبة الكفاءة:</strong> ${content.header?.components || ''}</p>
          <p><strong>مؤشرات الكفاءة:</strong> ${content.header?.indicators || ''}</p>
          <p><strong>الوسائل والسنادات:</strong> ${content.header?.materials || ''}</p>
        </div>

        <h3>مراحل سير الدرس</h3>
        <table>
          <thead>
            <tr>
              <th>المرحلة والمدة</th>
              <th>نشاط الأستاذ والتوجيهات</th>
              <th>نشاط المتعلم وملاحظاته</th>
              <th>معايير التقويم</th>
            </tr>
          </thead>
          <tbody>
            ${(content.stages || [])
              .map(
                (st: any) => `
                <tr>
                  <td><strong>${st.stageName}</strong><br>(${st.duration})</td>
                  <td>${st.teacherActivity}</td>
                  <td>${st.studentActivity}</td>
                  <td>${st.assessment}</td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>

        <h3>الخلاصة والقاعدة المعرفية:</h3>
        <p style="background-color: #e6f4ea; padding: 10px; border-radius: 5px;">${content.summary || ''}</p>

        <h3>النشاط العلاجي والداعم:</h3>
        <p>${content.remedialActivity || ''}</p>

        <h3>النشاط الإثرائي:</h3>
        <p>${content.enrichmentActivity || ''}</p>

        <h3>الواجب المنزلي:</h3>
        <p>${content.homework || ''}</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `مذكرة_${activePlan.title.replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('تم تنزيل المذكرة بصيغة Word بنجاح');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>صمم مذكرتي — المذكرات البيداغوجية للتعليم الابتدائي</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تصميم مذكرات رسمية احترافية وفق منهاج الجيل الثاني المخفف بضغطة زر واحدة
          </p>
        </div>

        {activePlan && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportWord}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>تصدير Word (.doc)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-bold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Generator Form Panel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 no-print">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              بيانات ومحددات الدرس
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                المادة:
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
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
                الميدان / المجال:
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="مثال: الحساب والعمليات / فهم المكتوب"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                المقطع التعلمي:
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="مثال: المقطع الأول"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                عنوان الدرس (إلزامي):
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: الجمع بالاحتفاظ"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                إضافات أو توجيهات خاصة بالأستاذ:
              </label>
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="مثال: التركيز على استعمال جدول المراتب والألواح..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          <button
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري بناء المذكرة التربوية...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>صمم مذكرتي بالذكاء الاصطناعي</span>
              </>
            )}
          </button>
        </div>

        {/* Right / Generated Lesson Plan View */}
        <div className="lg:col-span-2 space-y-4">
          {activePlan ? (
            <div className="printable-area p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              {/* Official Algerian Header Card */}
              <div className="p-4 rounded-xl border-2 border-emerald-600/30 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-600/20 pb-2">
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-300 text-sm">
                    {activePlan.title}
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    {activePlan.gradeLevel} · {activePlan.subject}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
                  <div>
                    <strong>الميدان:</strong> {activePlan.domain}
                  </div>
                  <div>
                    <strong>المقطع:</strong> {activePlan.section}
                  </div>
                  <div className="col-span-2">
                    <strong>مركبة الكفاءة:</strong>{' '}
                    {activePlan.content.header?.components || ''}
                  </div>
                  <div className="col-span-2">
                    <strong>مؤشرات الكفاءة:</strong>{' '}
                    {activePlan.content.header?.indicators || ''}
                  </div>
                  <div className="col-span-2">
                    <strong>الوسائل والسنادات:</strong>{' '}
                    {activePlan.content.header?.materials || ''}
                  </div>
                </div>
              </div>

              {/* Stages Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700 w-28">
                        المرحلة / المدة
                      </th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700">
                        نشاط الأستاذ والتوجيهات
                      </th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700">
                        نشاط المتعلم وملاحظاته
                      </th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700 w-24">
                        التقويم
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activePlan.content.stages || []).map((stage, sIdx) => (
                      <tr
                        key={sIdx}
                        className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/50"
                      >
                        <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 align-top">
                          {stage.stageName}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            ({stage.duration})
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 leading-relaxed align-top">
                          {stage.teacherActivity}
                        </td>
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 leading-relaxed align-top">
                          {stage.studentActivity}
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-500 border border-slate-200 dark:border-slate-700 align-top">
                          {stage.assessment}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Rule Box */}
              {activePlan.content.summary && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs">
                  <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-1">
                    الخلاصة والقاعدة المعرفية (تثبيت المكتسبات):
                  </h4>
                  <p className="text-amber-950 dark:text-amber-100 font-semibold leading-relaxed">
                    {activePlan.content.summary}
                  </p>
                </div>
              )}

              {/* Remedial & Enrichment & Homework */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {activePlan.content.remedialActivity && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      نشاط علاجي داعم:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {activePlan.content.remedialActivity}
                    </p>
                  </div>
                )}
                {activePlan.content.homework && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      الواجب المنزلي:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {activePlan.content.homework}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا توجد مذكرة معروضة حالياً
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                اختر المادة وعنوان الدرس من اللوحة الجانبية ثم اضغط «صمم مذكرتي» لتوليد نموذج رسمي كامل
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
