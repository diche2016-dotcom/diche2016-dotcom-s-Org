import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ParentReport } from '../types';
import {
  Mail,
  Sparkles,
  Download,
  Printer,
  User,
  HeartHandshake,
  CheckCircle2,
  Calendar,
  Loader2,
  Edit,
} from 'lucide-react';

export const ParentReports: React.FC = () => {
  const {
    classStudents,
    classAttendance,
    grades,
    classAssessments,
    activeClass,
    showToast,
  } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    classStudents[0]?.id || ''
  );
  const [reportType, setReportType] = useState<
    'brief' | 'detailed' | 'monthly' | 'trimester' | 'annual'
  >('trimester');

  const [generatedReport, setGeneratedReport] = useState<ParentReport | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableLetter, setEditableLetter] = useState<string>('');

  const student = classStudents.find((s) => s.id === selectedStudentId);

  // Compute student stats
  const studentGrades = grades.filter((g) => g.studentId === selectedStudentId);
  const average =
    studentGrades.length > 0
      ? (
          studentGrades.reduce((acc, g) => acc + g.score, 0) /
          studentGrades.length
        ).toFixed(2)
      : '8.50';

  const studentAtt = classAttendance.filter((a) => a.studentId === selectedStudentId);
  const presentCount = studentAtt.filter((a) => a.status === 'present').length;
  const attendanceRate =
    studentAtt.length > 0
      ? Math.round((presentCount / studentAtt.length) * 100)
      : 96;

  // Generate with Gemini AI
  const handleGenerate = async () => {
    if (!student) return;

    try {
      setIsGenerating(true);
      const res = await fetch('/api/ai/parent-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: `${student.firstName} ${student.lastName}`,
          gradeLevel: activeClass?.gradeLevel || 'التعليم الابتدائي',
          average: Number(average),
          attendanceRate,
          behavior: student.behaviorScore >= 4 ? 'منضبط، متعاون وخلوق' : 'نشيط ويحتاج تركيزاً إضافياً',
          reportType:
            reportType === 'trimester'
              ? 'تقرير نهاية الفصل الدراسي'
              : reportType === 'monthly'
              ? 'تقرير شهري للمتابعة'
              : 'تقرير تربوي شامل',
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const reportObj: ParentReport = {
        id: `rep-${Date.now()}`,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        classId: student.classId,
        reportType,
        date: new Date().toISOString().split('T')[0],
        title: data.title || 'تقرير المتابعة التربوية للولي الكريم',
        greeting: data.greeting || 'تحية طيبة وبعد...',
        generalAssessment: data.generalAssessment || '',
        highlights: data.highlights || [],
        areasForImprovement: data.areasForImprovement || [],
        homeRecommendations: data.homeRecommendations || [],
        closing: data.closing || 'وتفضلوا بقبول فائق عبارات التقدير والاحترام التربوي.',
        fullLetterText: data.fullLetterText || '',
      };

      setGeneratedReport(reportObj);
      setEditableLetter(reportObj.fullLetterText);
      showToast('تم صياغة تقرير ورسالة ولي الأمر بالذكاء الاصطناعي بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل في توليد تقرير ولي الأمر', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export to Word
  const handleExportWord = () => {
    if (!generatedReport || !student) return;

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>تقرير_ولي_أمر_${student.firstName}_${student.lastName}</title>
        <style>
          body { font-family: 'Arial', 'Cairo', sans-serif; direction: rtl; text-align: right; line-height: 1.6; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 20px; }
          .letter { padding: 20px; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="header">
          <p style="text-align: center; font-weight: bold;">الجمهورية الجزائرية الديمقراطية الشعبية — وزارة التربية الوطنية</p>
          <p style="text-align: center;"><strong>المدرسة:</strong> ${activeClass?.school || ''} | <strong>القسم:</strong> ${activeClass?.name || ''}</p>
          <h2 style="text-align: center; color: #059669;">${generatedReport.title}</h2>
        </div>

        <p><strong>إلى ولي أمر التلميذ(ة):</strong> ${student.firstName} ${student.lastName}</p>
        <p><strong>المعدل الفصلي التقديري:</strong> ${average} / 10 &nbsp; | &nbsp; <strong>نسبة المواظبة والحضور:</strong> ${attendanceRate}%</p>

        <div class="letter">
          <p>${editableLetter.replace(/\n/g, '<br/>')}</p>
        </div>

        <br/><br/>
        <table style="width: 100%;">
          <tr>
            <td>توقيع وختم الإدارة</td>
            <td style="text-align: left;">توقيع أستاذ القسم</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_ولي_أمر_${student.firstName}_${student.lastName}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تنزيل رسالة التقرير بصيغة Word');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-600" />
            <span>تقارير ورسائل الأولياء التربوية بالذكاء الاصطناعي</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            صياغة رسائل وتقارير شخصية إيجابية ومحفزة لكل تلميذ للتواصل البنّاء مع الولي
          </p>
        </div>

        {generatedReport && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportWord}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>تصدير Word (.doc)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 no-print">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              بيانات ومحددات التقرير
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                اختر التلميذ:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setGeneratedReport(null);
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-bold"
              >
                {classStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} (رقم {s.registrationNumber})
                  </option>
                ))}
              </select>
            </div>

            {student && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">ولي الأمر:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {student.parentName || 'الولي الكريم'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المعدل التقديري:</span>
                  <span className="font-bold text-emerald-600">{average} / 10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">نسبة الحضور:</span>
                  <span className="font-bold text-blue-600">{attendanceRate}%</span>
                </div>
              </div>
            )}

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                نوع وطبيعة التقرير:
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="trimester">تقرير فصلي تقييمي (موصى به)</option>
                <option value="monthly">تقرير متابعة شهري</option>
                <option value="brief">رسالة تشجيع وملاحظة موجزة</option>
                <option value="detailed">تقرير تربوي وسلوكي مفصل</option>
                <option value="annual">تقرير الحصيلة السنوية</option>
              </select>
            </div>
          </div>

          <button
            disabled={isGenerating || !student}
            onClick={handleGenerate}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري صياغة رسالة الولي...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>إنشاء تقرير ولي الأمر بالذكاء الاصطناعي</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Letter Preview */}
        <div className="lg:col-span-2 space-y-4">
          {generatedReport && student ? (
            <div className="printable-area p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-emerald-800 dark:text-emerald-400">
                    {generatedReport.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    إلى ولي أمر التلميذ(ة): {student.firstName} {student.lastName} · {activeClass?.name}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="no-print p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 text-xs font-semibold flex items-center gap-1 hover:bg-slate-50"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'معاينة' : 'تعديل النص'}</span>
                </button>
              </div>

              {/* Editable or Formatted Letter */}
              {isEditing ? (
                <textarea
                  rows={12}
                  value={editableLetter}
                  onChange={(e) => setEditableLetter(e.target.value)}
                  className="w-full text-xs leading-relaxed p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-sans text-slate-900 dark:text-white"
                />
              ) : (
                <div className="space-y-4 text-xs leading-relaxed text-slate-800 dark:text-slate-200 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-800/60">
                  <p className="font-bold">{generatedReport.greeting}</p>
                  <p className="whitespace-pre-line leading-relaxed">
                    {editableLetter || generatedReport.fullLetterText}
                  </p>
                  <p className="font-semibold pt-2">{generatedReport.closing}</p>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 text-center text-xs text-slate-600 dark:text-slate-400">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    أستاذ(ة) القسم
                  </p>
                  <p className="text-[11px] text-slate-400 mt-4">التوقيع والملاحظة</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    ولي الأمر
                  </p>
                  <p className="text-[11px] text-slate-400 mt-4">اطلعت ووافقت</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700">
              <Mail className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا يوجد تقرير معروض حالياً
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                اختر تلميذاً من القائمة واضغط على «إنشاء تقرير ولي الأمر بالذكاء الاصطناعي»
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
