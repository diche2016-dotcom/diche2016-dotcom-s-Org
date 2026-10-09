import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Assessment, Subject, StudentGrade } from '../types';
import {
  LineChart,
  Plus,
  Sparkles,
  Download,
  Award,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { exportGradesMatrixToExcel } from '../utils/excel';

export const GradesView: React.FC = () => {
  const {
    activeClass,
    classStudents,
    subjects,
    classAssessments,
    grades,
    addAssessment,
    updateGrade,
    showToast,
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    classAssessments[0]?.id || ''
  );
  const [showNewAssModal, setShowNewAssModal] = useState<boolean>(false);

  // New assessment form
  const [assTitle, setAssTitle] = useState<string>('');
  const [assSubjectId, setAssSubjectId] = useState<string>(subjects[0]?.id || '');
  const [assType, setAssType] = useState<'continuous' | 'test' | 'exam' | 'diagnostic'>('continuous');
  const [assSkill, setAssSkill] = useState<string>('');
  const [assMaxScore, setAssMaxScore] = useState<number>(10);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);

  if (!activeClass) return null;

  const currentAssessment = classAssessments.find((a) => a.id === selectedAssessmentId) || classAssessments[0];

  // Calculate stats for current assessment
  const assessmentGrades = grades.filter((g) => g.assessmentId === currentAssessment?.id);
  const scores = assessmentGrades.map((g) => g.score);
  const currentAvg =
    scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : '0.00';
  const topStudents = classStudents.filter((s) => {
    const gr = assessmentGrades.find((g) => g.studentId === s.id);
    return gr && gr.score >= 8.5;
  });
  const strugglingStudents = classStudents.filter((s) => {
    const gr = assessmentGrades.find((g) => g.studentId === s.id);
    return gr && gr.score < 5.0;
  });

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assTitle.trim()) {
      showToast('يرجى كتابة عنوان للتقويم', 'error');
      return;
    }
    const created = addAssessment({
      classId: activeClass.id,
      subjectId: assSubjectId,
      title: assTitle.trim(),
      term: 'term1',
      type: assType,
      skill: assSkill.trim(),
      date: new Date().toISOString().split('T')[0],
      maxScore: assMaxScore,
    });
    setSelectedAssessmentId(created.id);
    setShowNewAssModal(false);
  };

  // Trigger Gemini Results Analysis
  const handleAnalyzeResultsAI = async () => {
    try {
      setIsAnalyzing(true);
      const res = await fetch('/api/ai/analyze-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classSummary: {
            className: activeClass.name,
            totalStudents: classStudents.length,
            currentAssessmentTitle: currentAssessment?.title,
            averageScore: currentAvg,
          },
          subjectStats: subjects.map((s) => s.name),
          strugglingStudents: strugglingStudents.map((s) => ({
            name: `${s.firstName} ${s.lastName}`,
            score: assessmentGrades.find((g) => g.studentId === s.id)?.score,
          })),
          topStudents: topStudents.map((s) => ({
            name: `${s.firstName} ${s.lastName}`,
            score: assessmentGrades.find((g) => g.studentId === s.id)?.score,
          })),
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAiAnalysisResult(data);
      showToast('تم تحليل النتائج بالذكاء الاصطناعي واقتراح خطة المعالجة بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل في تحليل النتائج', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-emerald-600" />
            <span>النتائج والتقويم البيداغوجي وتحليل المستوى ({activeClass.name})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            رصد العلامات، حساب المعدلات الفورية، واقتراح أنشطة معالجة تربوية بالذكاء الاصطناعي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyzeResultsAI}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>حلل النتائج بالذكاء الاصطناعي</span>
          </button>

          <button
            onClick={() => setShowNewAssModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ تقويم جديد</span>
          </button>

          <button
            onClick={() => {
              exportGradesMatrixToExcel(classStudents, subjects, classAssessments, grades, activeClass.name);
              showToast('تم تصدير كشف العلامات إلى Excel');
            }}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
            title="تصدير كشف العلامات"
          >
            <Download className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Assessment Selector & Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Selector Dropdown Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">اختر التقويم المعروض:</span>
          <select
            value={selectedAssessmentId}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            className="w-full text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
          >
            {classAssessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 block font-mono">
            المستوى المستهدف: {currentAssessment?.maxScore || 10} / 10
          </span>
        </div>

        {/* Metric 1: Class Average */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">متوسط القسم في هذا التقويم</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black font-mono text-emerald-600 tabular-nums">
              {currentAvg}
            </span>
            <span className="text-xs text-slate-400">/ 10</span>
          </div>
        </div>

        {/* Metric 2: Top Students */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">المتفوقون (≥ 8.5)</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-600 mt-2">
            {topStudents.length} تلاميذ
          </div>
        </div>

        {/* Metric 3: Remedial Needed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">بحاجة إلى معالجة (&lt; 5)</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black font-mono text-red-600 mt-2">
            {strugglingStudents.length} تلاميذ
          </div>
        </div>
      </div>

      {/* AI Pedagogical Analysis Box if triggered */}
      {aiAnalysisResult && (
        <div className="p-6 rounded-2xl bg-radial from-purple-500/10 to-transparent border border-purple-500/30 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-purple-200 dark:border-purple-900/50 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                تقرير التحليل التشخيصي وخطة المعالجة البيداغوجية بالذكاء الاصطناعي
              </h3>
            </div>
            <button
              onClick={() => setAiAnalysisResult(null)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              إغلاق التقرير
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-emerald-600 block mb-1">نقاط القوة المكتسبة:</span>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                {(aiAnalysisResult.strengths || []).map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-red-600 block mb-1">التعثرات والصعوبات الملاحظة:</span>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                {(aiAnalysisResult.weaknesses || []).map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Remedial Activity ideas */}
          {aiAnalysisResult.remedialSuggestions && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-purple-700 dark:text-purple-400 block">
                اقتراحات الأنشطة العلاجية المقترحة داخل القسم:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aiAnalysisResult.remedialSuggestions.map((rem: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50">
                    <p className="font-bold text-slate-900 dark:text-white">{rem.title}</p>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">{rem.exerciseIdea}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grade Entry Table */}
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <table className="w-full text-xs text-right border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="p-3 w-14 text-center">الرقم</th>
              <th className="p-3">اللقب والاسم</th>
              <th className="p-3 text-center w-36">العلامة / {currentAssessment?.maxScore || 10}</th>
              <th className="p-3 text-center">التقدير البيداغوجي</th>
              <th className="p-3">الملاحظة الفردية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {classStudents.map((st) => {
              const currentGrade = grades.find(
                (g) => g.assessmentId === currentAssessment?.id && g.studentId === st.id
              );
              const score = currentGrade ? currentGrade.score : 0;

              return (
                <tr
                  key={st.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3 text-center font-mono font-bold text-slate-400">
                    {st.registrationNumber}
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {st.lastName} {st.firstName}
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      step="0.25"
                      min={0}
                      max={currentAssessment?.maxScore || 10}
                      value={score}
                      onChange={(e) => {
                        if (currentAssessment) {
                          updateGrade(currentAssessment.id, st.id, Number(e.target.value));
                        }
                      }}
                      className="w-24 text-center font-mono font-extrabold text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 focus:border-emerald-500"
                    />
                  </td>
                  <td className="p-3 text-center">
                    {score >= 9 ? (
                      <span className="font-bold text-emerald-600">ممتاز جداً 🌟</span>
                    ) : score >= 7 ? (
                      <span className="font-bold text-blue-600">جيد ومستوعب</span>
                    ) : score >= 5 ? (
                      <span className="font-bold text-amber-600">متوسط مقبول</span>
                    ) : (
                      <span className="font-bold text-red-600">يحتاج معالجة ⚠️</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">
                    {score < 5
                      ? 'يوجه لحصص المعالجة البيداغوجية الأسبوعية'
                      : score >= 9
                      ? 'يثمن جهده ويمنح أنشطة إثرائية'
                      : 'مواصلة المتابعة المستمرة'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Assessment Modal */}
      {showNewAssModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateAssessment}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                إضافة تقويم جديد للقسم
              </h3>
              <button
                type="button"
                onClick={() => setShowNewAssModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  عنوان التقويم (إلزامي):
                </label>
                <input
                  type="text"
                  required
                  value={assTitle}
                  onChange={(e) => setAssTitle(e.target.value)}
                  placeholder="مثال: تقويم الرياضيات: الأعداد الطبيعية"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  المادة:
                </label>
                <select
                  value={assSubjectId}
                  onChange={(e) => setAssSubjectId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  نوع التقويم:
                </label>
                <select
                  value={assType}
                  onChange={(e) => setAssType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="continuous">تقويم مستمر مرحلي</option>
                  <option value="test">فرض كتابي</option>
                  <option value="exam">اختبار فصلي رسمي</option>
                  <option value="diagnostic">تقويم تشخيصي</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  المهارة أو الكفاءة المستهدفة:
                </label>
                <input
                  type="text"
                  value={assSkill}
                  onChange={(e) => setAssSkill(e.target.value)}
                  placeholder="مثال: التحكم في الجمع بالاحتفاظ"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewAssModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                حفظ وبدء رصد العلامات
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
