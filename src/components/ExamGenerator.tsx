import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GeneratedExam, ExamQuestion } from '../types';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  CheckCircle,
  Clock,
  Award,
  Loader2,
  Trash2,
  RefreshCw,
} from 'lucide-react';

export const ExamGenerator: React.FC = () => {
  const {
    exams,
    addExam,
    deleteExam,
    showToast,
    subjects,
    activeClass,
  } = useApp();

  const [activeExam, setActiveExam] = useState<GeneratedExam | null>(exams[0] || null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(true);

  // Form Inputs
  const [gradeLevel, setGradeLevel] = useState<string>(activeClass?.gradeLevel || 'السنة الرابعة ابتدائي');
  const [subject, setSubject] = useState<string>('الرياضيات');
  const [topic, setTopic] = useState<string>('الأعداد إلى 999999، الحساب، وحل مسألة مركبة');
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<string>('متوسط');
  const [duration, setDuration] = useState<string>('45 دقيقة');

  // Trigger Gemini AI generation
  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch('/api/ai/exam-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel,
          subject,
          topic,
          questionCount,
          difficulty,
          duration,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newExam: GeneratedExam = {
        id: `exam-${Date.now()}`,
        examTitle: data.examTitle || 'تقويم تشخيصي وفصلي',
        gradeLevel,
        subject,
        topic,
        duration: data.duration || duration,
        totalPoints: data.totalPoints || 10,
        instructions: data.instructions || 'أجب بعناية وبخط واضح ونظم إجاباتك.',
        questions: data.questions || [],
        modelAnswerSummary: data.modelAnswerSummary || '',
        createdAt: new Date().toISOString().split('T')[0],
      };

      addExam(newExam);
      setActiveExam(newExam);
      showToast('تم توليد نموذج الاختبار مع التصحيح النموذجي بنجاح!');
    } catch (err: any) {
      showToast(err.message || 'فشل في توليد الاختبار', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export to Word Document (.doc)
  const handleExportWord = () => {
    if (!activeExam) return;

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${activeExam.examTitle}</title>
        <style>
          body { font-family: 'Arial', 'Cairo', sans-serif; direction: rtl; text-align: right; }
          .exam-header { border: 2px solid #000; padding: 10px; margin-bottom: 20px; }
          .question { margin-bottom: 20px; padding: 10px; border-bottom: 1px dashed #999; }
          .points { float: left; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="exam-header">
          <p style="text-align: center; font-weight: bold;">الجمهورية الجزائرية الديمقراطية الشعبية — وزارة التربية الوطنية</p>
          <table style="width: 100%;">
            <tr>
              <td>المستوى: ${activeExam.gradeLevel}</td>
              <td style="text-align: center;">المادة: ${activeExam.subject}</td>
              <td style="text-align: left;">المدة: ${activeExam.duration}</td>
            </tr>
          </table>
          <p style="text-align: center; font-size: 18px; font-weight: bold;">${activeExam.examTitle}</p>
          <p>الاسم واللقب: ..................................................... القسم: ............... العلامة: ...... / ${activeExam.totalPoints}</p>
        </div>

        ${activeExam.questions
          .map(
            (q, i) => `
          <div class="question">
            <span class="points">(${q.points} ن)</span>
            <p><strong>التمرين ${i + 1}:</strong> ${q.text}</p>
            ${q.options ? `<p>${q.options.join(' &nbsp; &nbsp; ')}</p>` : ''}
            <div style="height: 60px;"></div>
          </div>
        `
          )
          .join('')}

        ${
          showModelAnswer
            ? `
          <hr style="page-break-before: always;" />
          <h2>عناصر الإجابة النموذجية وسلم التنقيط</h2>
          ${activeExam.questions
            .map(
              (q, i) => `
            <p><strong>التمرين ${i + 1} (${q.points} نقاط):</strong></p>
            <p>${q.modelAnswer}</p>
          `
            )
            .join('')}
        `
            : ''
        }
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `اختبار_${activeExam.subject}_${activeExam.gradeLevel}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تنزيل موضوع الاختبار بصيغة Word');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>بنك ومولد الاختبارات والتقويمات بالذكاء الاصطناعي</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            توليد مواضيع اختبارات متوازنة متوافقة مع البرامج الرسمية مع التصحيح النموذجي
          </p>
        </div>

        {activeExam && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                showModelAnswer
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border-emerald-500/40'
                  : 'border-slate-300 dark:border-slate-700 text-slate-500'
              }`}
            >
              {showModelAnswer ? 'إخفاء التصحيح' : 'إظهار التصحيح النموذجي'}
            </button>

            <button
              onClick={handleExportWord}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>تصدير Word</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الموضوع</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form settings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 no-print">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              إعدادات موضوع الاختبار
            </h3>
          </div>

          <div className="space-y-3 text-xs">
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
                الدروس أو المفاهيم المستهدفة:
              </label>
              <textarea
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="مثال: الحساب، الكسور، المسائل..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  عدد الأسئلة:
                </label>
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  الصعوبة:
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option>ميسر وسهل</option>
                  <option>متوسط ومتوازن</option>
                  <option>متقدم وتمايزي</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                المدة المقترحة:
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="45 دقيقة"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
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
                <span>جاري صياغة موضوع الاختبار...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>توليد الاختبار بالذكاء الاصطناعي</span>
              </>
            )}
          </button>
        </div>

        {/* Exam Preview Page */}
        <div className="lg:col-span-2 space-y-4">
          {activeExam ? (
            <div className="printable-area p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              {/* Exam Header */}
              <div className="border-2 border-slate-900 dark:border-slate-200 p-4 rounded-xl text-center space-y-2">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  الجمهورية الجزائرية الديمقراطية الشعبية — وزارة التربية الوطنية
                </p>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 border-t border-b border-slate-300 dark:border-slate-700 py-1.5 font-semibold">
                  <span>المستوى: {activeExam.gradeLevel}</span>
                  <span>المادة: {activeExam.subject}</span>
                  <span>المدة: {activeExam.duration}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeExam.examTitle}
                </h3>
                <div className="text-xs text-slate-500 pt-1 flex justify-between">
                  <span>الاسم واللقب: .......................................</span>
                  <span>القسم: ...................</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    العلامة: ..... / {activeExam.totalPoints}
                  </span>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {activeExam.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                        التمرين {idx + 1}:
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                        ({q.points} نقاط)
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {q.text}
                    </p>

                    {q.options && q.options.length > 0 && (
                      <div className="flex flex-wrap gap-3 pt-2 text-xs">
                        {q.options.map((opt, oIdx) => (
                          <span
                            key={oIdx}
                            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Model Answer preview */}
                    {showModelAnswer && q.modelAnswer && (
                      <div className="mt-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                          الإجابة النموذجية وسلّم التنقيط:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {q.modelAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا يوجد اختبار معروض حالياً
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                حدد المستوى والمادة ثم اضغط «توليد الاختبار بالذكاء الاصطناعي»
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
