import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  downloadStudentTemplate,
  parseExcelOrCsvFile,
  guessFieldMapping,
} from '../utils/excel';
import {
  FileSpreadsheet,
  Image as ImageIcon,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Camera,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Loader2,
  RefreshCw,
  Plus,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
}

type ImportSource = 'excel' | 'image' | 'pdf';

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
  isOpen,
  onClose,
  defaultClassId,
}) => {
  const {
    classes,
    activeClassId,
    addClass,
    bulkAddStudents,
    addImportLog,
    showToast,
    user,
    students,
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [sourceType, setSourceType] = useState<ImportSource>('excel');
  const [targetClassId, setTargetClassId] = useState<string>(
    defaultClassId || activeClassId || classes[0]?.id || ''
  );
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassGrade, setNewClassGrade] = useState<string>('السنة الرابعة ابتدائي');

  // File & parsing state
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [editableStudents, setEditableStudents] = useState<Array<Partial<Student> & { isDuplicate?: boolean; warning?: string }>>([]);
  const [parsingErrors, setParsingErrors] = useState<string[]>([]);

  // Duplicate policy: 'skip' | 'update' | 'new'
  const [duplicatePolicy, setDuplicatePolicy] = useState<'skip' | 'update' | 'new'>('skip');

  // Import Result Stats
  const [importResult, setImportResult] = useState<{
    added: number;
    updated: number;
    skipped: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Drag & Drop / File Select for Excel & CSV
  const handleExcelFile = async (file: File) => {
    try {
      setIsLoading(true);
      setLoadingMessage('جاري قراءة وتحليل ملف Excel...');
      setFileName(file.name);

      const parsed = await parseExcelOrCsvFile(file);
      setParsedHeaders(parsed.headers);
      setParsingErrors(parsed.errors);

      // Auto-map columns
      const initialMap: Record<string, string> = {};
      parsed.headers.forEach((h) => {
        const field = guessFieldMapping(h);
        if (field) initialMap[field] = h;
      });
      setColumnMapping(initialMap);

      // Check duplicates against target class
      const classExisting = students.filter((s) => s.classId === targetClassId);
      const rowsWithDuplicates = parsed.mappedRows.map((row) => {
        const isDup = classExisting.some(
          (s) =>
            (row.registrationNumber && s.registrationNumber === row.registrationNumber) ||
            (s.lastName.trim().toLowerCase() === (row.lastName || '').trim().toLowerCase() &&
              s.firstName.trim().toLowerCase() === (row.firstName || '').trim().toLowerCase())
        );
        return {
          ...row,
          isDuplicate: isDup,
          warning: !row.birthDate ? 'تاريخ الميلاد غير محدد' : !row.lastName ? 'اللقب غير موجود' : undefined,
        };
      });

      setEditableStudents(rowsWithDuplicates);
      setStep(3); // Proceed to column review & preview
    } catch (err: any) {
      showToast(err.message || 'تعذر تحليل الملف', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Image or PDF OCR through Gemini Server API
  const handleImageOrPdfFile = async (file: File) => {
    try {
      setIsLoading(true);
      setLoadingMessage('جاري تحليل الجدول والتعرف على نصوص التلاميذ بالذكاء الاصطناعي (OCR)...');
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;

        try {
          const res = await fetch('/api/ai/ocr-students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/jpeg',
            }),
          });

          const data = await res.json();
          if (data.error) {
            throw new Error(data.error);
          }

          const extractedList = data.students || [];
          if (extractedList.length === 0) {
            throw new Error('لم يتمكن النظام من استخراج أي تلاميذ من الصورة. تأكد من وضوح الصورة وتواجد جدول.');
          }

          const classExisting = students.filter((s) => s.classId === targetClassId);
          const mapped = extractedList.map((st: any) => {
            const isDup = classExisting.some(
              (s) =>
                (st.registrationNumber && s.registrationNumber === st.registrationNumber) ||
                (s.lastName.trim().toLowerCase() === (st.lastName || '').trim().toLowerCase() &&
                  s.firstName.trim().toLowerCase() === (st.firstName || '').trim().toLowerCase())
            );
            return {
              registrationNumber: st.registrationNumber || '',
              lastName: st.lastName || '',
              firstName: st.firstName || '',
              birthDate: st.birthDate || '',
              gender: st.gender === 'F' ? 'F' : 'M',
              parentName: st.parentName || '',
              parentPhone: st.parentPhone || '',
              notes: st.notes || '',
              isDuplicate: isDup,
              warning: st.confidenceWarning || (!st.birthDate ? 'تاريخ الميلاد غير واضح' : undefined),
            };
          });

          setEditableStudents(mapped);
          setParsedHeaders(data.detectedColumns || ['رقم التسجيل', 'اللقب', 'الاسم', 'تاريخ الميلاد', 'الجنس']);
          setStep(4); // Direct review
        } catch (apiErr: any) {
          showToast(apiErr.message || 'فشل في استخراج البيانات بالذكاء الاصطناعي', 'error');
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsLoading(false);
      showToast(err.message || 'حدث خطأ في قراءة ملف الصورة', 'error');
    }
  };

  // Commit Import
  const handleConfirmImport = () => {
    let finalClassId = targetClassId;

    // Check if new class was created
    if (targetClassId === 'NEW_CLASS') {
      if (!newClassName.trim()) {
        showToast('يرجى كتابة اسم القسم الجديد', 'error');
        return;
      }
      const created = addClass({
        name: newClassName.trim(),
        gradeLevel: newClassGrade,
        academicYear: user.academicYear,
        school: user.school,
        studentCount: 0,
      });
      finalClassId = created.id;
    }

    const options = {
      skipDuplicates: duplicatePolicy === 'skip',
      updateExisting: duplicatePolicy === 'update',
    };

    const res = bulkAddStudents(editableStudents, finalClassId, options);
    setImportResult(res);

    // Add log
    const targetClassObj = classes.find((c) => c.id === finalClassId);
    addImportLog({
      date: new Date().toISOString(),
      fileName: fileName || 'استيراد يدوي',
      className: targetClassObj?.name || newClassName,
      totalRows: editableStudents.length,
      importedCount: res.added,
      updatedCount: res.updated,
      skippedCount: res.skipped,
      errorsCount: parsingErrors.length,
    });

    setStep(7); // Show Results Screen
    showToast(`تم استيراد ${res.added} تلميذاً بنجاح`);
  };

  // Download error log
  const handleDownloadErrors = () => {
    if (parsingErrors.length === 0) return;
    const ws = XLSX.utils.aoa_to_sheet([
      ['أخطاء الاستيراد التي تحتاج إلى تصحيح'],
      ...parsingErrors.map((err) => [err]),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الأخطاء');
    XLSX.writeFile(wb, `ملف_أخطاء_استيراد_${fileName || 'قائمة'}.xlsx`);
  };

  // Update cell in preview table
  const updatePreviewCell = (index: number, field: keyof Student, value: string) => {
    setEditableStudents((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Wizard Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                استيراد قائمة التلاميذ إلى القسم
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Excel · CSV · صورة بالكاميرا (OCR) · ملف PDF
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between overflow-x-auto text-xs font-semibold">
          {[
            { num: 1, label: '1. المصدر' },
            { num: 2, label: '2. القسم' },
            { num: 3, label: '3. مطابقة الأعمدة' },
            { num: 4, label: '4. مراجعة البيانات' },
            { num: 5, label: '5. التحقق والتكرار' },
            { num: 6, label: '6. التأكيد' },
            { num: 7, label: '7. النتيجة' },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 whitespace-nowrap px-2 py-1 rounded-lg transition-colors ${
                step === s.num
                  ? 'bg-emerald-600 text-white'
                  : step > s.num
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-white/20">
                {s.num}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Wizard Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {loadingMessage}
              </p>
              <p className="text-xs text-slate-400">يرجى الانتظار بضع ثوانٍ...</p>
            </div>
          ) : (
            <>
              {/* STEP 1: Select Import Source */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      اختر طريقة استيراد قائمة التلاميذ:
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      يمكنك رفع ملف جاهز أو مسح قائمة ورقية مصورة بالكاميرا بالذكاء الاصطناعي
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Excel / CSV option */}
                    <div
                      onClick={() => setSourceType('excel')}
                      className={`cursor-pointer rounded-2xl border-2 p-5 text-right transition-all ${
                        sourceType === 'excel'
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center mb-3">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                        ملف Excel أو CSV
                      </h5>
                      <p className="text-xs text-slate-500 mt-1">
                        يدعم صيغ .xlsx و .xls و .csv بكل اللغات
                      </p>
                    </div>

                    {/* Image / Camera Photo OCR */}
                    <div
                      onClick={() => setSourceType('image')}
                      className={`cursor-pointer rounded-2xl border-2 p-5 text-right transition-all ${
                        sourceType === 'image'
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-3">
                        <Camera className="w-6 h-6" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>صورة أو تصوير كاميرا</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      </h5>
                      <p className="text-xs text-slate-500 mt-1">
                        التعرف الذكي (OCR) على الجداول الورقية المصورة
                      </p>
                    </div>

                    {/* PDF Table Option */}
                    <div
                      onClick={() => setSourceType('pdf')}
                      className={`cursor-pointer rounded-2xl border-2 p-5 text-right transition-all ${
                        sourceType === 'pdf'
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>مستند PDF</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      </h5>
                      <p className="text-xs text-slate-500 mt-1">
                        استخراج جداول التلاميذ من ملفات PDF الممسوحة
                      </p>
                    </div>
                  </div>

                  {/* Template Download Callout */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        تحتاج إلى نموذج Excel فارغ معتمد ومضبوط بالأعمدة؟
                      </p>
                      <p className="text-[11px] text-slate-500">
                        قم بتنزيل النموذج وتعبئة أسماء تلاميذك ثم رفعه هنا بنقرة واحدة
                      </p>
                    </div>
                    <button
                      onClick={() => downloadStudentTemplate(user.language)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تحميل نموذج Excel جاهز</span>
                    </button>
                  </div>

                  {/* Drag and Drop Box */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        if (sourceType === 'excel') handleExcelFile(file);
                        else handleImageOrPdfFile(file);
                      }
                    }}
                    onClick={() => {
                      if (sourceType === 'excel') fileInputRef.current?.click();
                      else imageInputRef.current?.click();
                    }}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        اضغط لاختيار الملف أو اسحبه وأفلته هنا
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {sourceType === 'excel'
                          ? 'الملفات المدعومة: .xlsx, .xls, .csv'
                          : sourceType === 'image'
                          ? 'الصور المدعومة: JPG, PNG, WEBP أو التقاط بالكاميرا'
                          : 'المستندات المدعومة: .pdf'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                    >
                      تصفح الملفات من جهازك
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleExcelFile(file);
                    }}
                  />

                  <input
                    type="file"
                    ref={imageInputRef}
                    accept={sourceType === 'image' ? 'image/*' : 'application/pdf,image/*'}
                    capture={sourceType === 'image' ? 'environment' : undefined}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageOrPdfFile(file);
                    }}
                  />
                </div>
              )}

              {/* STEP 2: Target Class Selection */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    الخطوة 2: تحديد القسم المراد إضافة التلاميذ إليه
                  </h4>
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      اختر القسم:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {classes.map((cls) => (
                        <div
                          key={cls.id}
                          onClick={() => setTargetClassId(cls.id)}
                          className={`cursor-pointer rounded-xl border p-3.5 text-right transition-all ${
                            targetClassId === cls.id
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-600'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {cls.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {cls.studentCount} تلميذ
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{cls.gradeLevel}</p>
                        </div>
                      ))}

                      {/* Option to create a new class right here */}
                      <div
                        onClick={() => setTargetClassId('NEW_CLASS')}
                        className={`cursor-pointer rounded-xl border-2 border-dashed p-3.5 text-right transition-all ${
                          targetClassId === 'NEW_CLASS'
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                          <Plus className="w-4 h-4" />
                          <span>إنشاء قسم جديد واستيراد القائمة إليه</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          سيتم إنشاء القسم وإضافة التلاميذ المستوردين إليه مباشرة
                        </p>
                      </div>
                    </div>

                    {targetClassId === 'NEW_CLASS' && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 mt-4">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          بيانات القسم الجديد:
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">
                              اسم القسم:
                            </label>
                            <input
                              type="text"
                              value={newClassName}
                              onChange={(e) => setNewClassName(e.target.value)}
                              placeholder="مثال: السنة الأولى ابتدائي - قسم أ"
                              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">
                              المستوى:
                            </label>
                            <select
                              value={newClassGrade}
                              onChange={(e) => setNewClassGrade(e.target.value)}
                              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                            >
                              <option>السنة الأولى ابتدائي</option>
                              <option>السنة الثانية ابتدائي</option>
                              <option>السنة الثالثة ابتدائي</option>
                              <option>السنة الرابعة ابتدائي</option>
                              <option>السنة الخامسة ابتدائي</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Column Mapping */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      الخطوة 3: مطابقة أعمدة الملف مع حقول النظام
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      لقد طابق النظام الحقول تلقائياً. تأكد من صحة الربط أو عدلها إذا لزم الأمر:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      { key: 'registrationNumber', label: 'رقم التسجيل' },
                      { key: 'lastName', label: 'اللقب (إلزامي)' },
                      { key: 'firstName', label: 'الاسم (إلزامي)' },
                      { key: 'birthDate', label: 'تاريخ الميلاد' },
                      { key: 'gender', label: 'الجنس' },
                      { key: 'parentName', label: 'اسم ولي الأمر' },
                      { key: 'parentPhone', label: 'رقم هاتف الولي' },
                      { key: 'notes', label: 'ملاحظات' },
                    ].map((f) => (
                      <div
                        key={f.key}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
                      >
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {f.label}
                        </span>
                        <select
                          value={columnMapping[f.key] || ''}
                          onChange={(e) =>
                            setColumnMapping({ ...columnMapping, [f.key]: e.target.value })
                          }
                          className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-slate-800 dark:text-slate-200 max-w-[150px]"
                        >
                          <option value="">-- تجاهل --</option>
                          {parsedHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Review Extracted Data (Editable Table) */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        الخطوة 4: مراجعة البيانات وتعديلها قبل الحفظ
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        تم استخراج {editableStudents.length} تلميذاً. يمكنك النقر على أي خلية لتصحيحها مباشرة:
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                      {editableStudents.length} تلميذ جاهز
                    </div>
                  </div>

                  {/* Editable preview table */}
                  <div className="overflow-x-auto max-h-80 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-xs text-right border-collapse">
                      <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 text-slate-700 dark:text-slate-300">
                        <tr>
                          <th className="p-2 border-b border-slate-200 dark:border-slate-700 w-12">#</th>
                          <th className="p-2 border-b border-slate-200 dark:border-slate-700">رقم التسجيل</th>
                          <th className="p-2 border-b border-slate-200 dark:border-slate-700">اللقب</th>
                          <th className="p-2 border-b border-slate-200 dark:border-slate-700">الاسم</th>
                          <th className="p-2 border-b border-slate-200 dark:border-slate-700">تاريخ الميلاد</th>
                          <th className="p-2 border-b border-slate-200 dark:border-slate-700">الجنس</th>
                          <th className="p-2 border-b border-slate-200 dark:border-slate-700">ولي الأمر</th>
                          <th className="p-2 border-b border-slate-200 dark:border-slate-700">الهاتف</th>
                          <th className="p-2 border-b border-slate-200 dark:border-slate-700">حالة السجل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {editableStudents.map((st, idx) => (
                          <tr
                            key={idx}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                              st.isDuplicate ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                            }`}
                          >
                            <td className="p-2 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="p-1">
                              <input
                                type="text"
                                value={st.registrationNumber || ''}
                                onChange={(e) => updatePreviewCell(idx, 'registrationNumber', e.target.value)}
                                className="w-full p-1 text-xs bg-transparent border-b border-transparent focus:border-emerald-500 font-mono"
                              />
                            </td>
                            <td className="p-1">
                              <input
                                type="text"
                                value={st.lastName || ''}
                                onChange={(e) => updatePreviewCell(idx, 'lastName', e.target.value)}
                                className="w-full p-1 text-xs bg-transparent border-b border-transparent focus:border-emerald-500 font-semibold"
                              />
                            </td>
                            <td className="p-1">
                              <input
                                type="text"
                                value={st.firstName || ''}
                                onChange={(e) => updatePreviewCell(idx, 'firstName', e.target.value)}
                                className="w-full p-1 text-xs bg-transparent border-b border-transparent focus:border-emerald-500 font-semibold"
                              />
                            </td>
                            <td className="p-1">
                              <input
                                type="text"
                                value={st.birthDate || ''}
                                onChange={(e) => updatePreviewCell(idx, 'birthDate', e.target.value)}
                                className="w-full p-1 text-xs bg-transparent border-b border-transparent focus:border-emerald-500 font-mono"
                                placeholder="YYYY-MM-DD"
                              />
                            </td>
                            <td className="p-1">
                              <select
                                value={st.gender || 'M'}
                                onChange={(e) => updatePreviewCell(idx, 'gender', e.target.value)}
                                className="text-xs bg-transparent border-none p-1"
                              >
                                <option value="M">ذكر</option>
                                <option value="F">أنثى</option>
                              </select>
                            </td>
                            <td className="p-1">
                              <input
                                type="text"
                                value={st.parentName || ''}
                                onChange={(e) => updatePreviewCell(idx, 'parentName', e.target.value)}
                                className="w-full p-1 text-xs bg-transparent border-b border-transparent focus:border-emerald-500"
                              />
                            </td>
                            <td className="p-1">
                              <input
                                type="text"
                                value={st.parentPhone || ''}
                                onChange={(e) => updatePreviewCell(idx, 'parentPhone', e.target.value)}
                                className="w-full p-1 text-xs bg-transparent border-b border-transparent focus:border-emerald-500 font-mono"
                              />
                            </td>
                            <td className="p-2 whitespace-nowrap">
                              {st.isDuplicate ? (
                                <span className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1 font-bold">
                                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                                  مكرر
                                </span>
                              ) : st.warning ? (
                                <span className="text-[10px] text-orange-600 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                                  {st.warning}
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  جاهز
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 5: Duplicate Handling Strategy */}
              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      الخطوة 5: التحقق من التكرار وسياسة المعالجة
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      حدد ماذا يفعل النظام عندما يكتشف تلميذاً موجوداً مسبقاً بنفس رقم التسجيل أو الاسم واللقب:
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label
                      onClick={() => setDuplicatePolicy('skip')}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        duplicatePolicy === 'skip'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-600'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={duplicatePolicy === 'skip'}
                        onChange={() => setDuplicatePolicy('skip')}
                        className="mt-1 text-emerald-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          تجاهل التلاميذ المكررين وعدم استيرادهم (موصى به)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          يحافظ على السجلات الحالية في القسم ويمنع تكرار الأسماء
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setDuplicatePolicy('update')}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        duplicatePolicy === 'update'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-600'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={duplicatePolicy === 'update'}
                        onChange={() => setDuplicatePolicy('update')}
                        className="mt-1 text-emerald-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          تحديث بيانات التلميذ الحالي بالبيانات الجديدة
                        </p>
                        <p className="text-[11px] text-slate-500">
                          يستبدل تاريخ الميلاد، هاتف الولي، والملاحظات بالبيانات المستوردة
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setDuplicatePolicy('new')}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        duplicatePolicy === 'new'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-600'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={duplicatePolicy === 'new'}
                        onChange={() => setDuplicatePolicy('new')}
                        className="mt-1 text-emerald-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          استيراد كنسخة جديدة برقم مختلف
                        </p>
                        <p className="text-[11px] text-slate-500">
                          سيتم إنشاء تلميذ جديد بغض النظر عن تشابه الأسماء
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Errors count warning */}
                  {parsingErrors.length > 0 && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span>تم العثور على {parsingErrors.length} صفوف تحتاج إلى مراجعة</span>
                      </div>
                      <button
                        onClick={handleDownloadErrors}
                        className="text-xs font-bold text-red-700 underline"
                      >
                        تنزيل ملف الأخطاء (.xlsx)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 6: Confirm Import Summary */}
              {step === 6 && (
                <div className="space-y-5 text-center py-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      جاهز لإضافة التلاميذ إلى القسم
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      راجع الملخص واضغط على «تأكيد الاستيراد» لحفظ السجلات
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-xl font-extrabold text-emerald-600">
                        {editableStudents.length}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">إجمالي التلاميذ</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-xl font-extrabold text-blue-600">
                        {editableStudents.filter((s) => !s.isDuplicate).length}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">تلاميذ جدد</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-xl font-extrabold text-amber-600">
                        {editableStudents.filter((s) => s.isDuplicate).length}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">تلاميذ مكررون</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: Import Complete Result */}
              {step === 7 && importResult && (
                <div className="space-y-5 text-center py-6">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      تم استيراد قائمة التلاميذ بنجاح!
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      تم تحديث سجلات القسم وأصبح بإمكانك تسجيل الحضور ورصد النتائج فوراً
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-right space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">تلاميذ تمت إضافتهم:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {importResult.added} تلميذاً
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">سجلات تم تحديثها:</span>
                      <span className="font-bold text-blue-700 dark:text-blue-300">
                        {importResult.updated}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">سجلات مكررة تم تجاهلها:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-300">
                        {importResult.skipped}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
                  >
                    عرض قائمة التلاميذ في القسم الآن
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Wizard Navigation Footer */}
        {step < 7 && !isLoading && (
          <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>الخطوة السابقة</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                إلغاء
              </button>

              {step < 6 ? (
                <button
                  disabled={editableStudents.length === 0 && step >= 3}
                  onClick={() => {
                    if (step === 1 && editableStudents.length > 0) setStep(2);
                    else if (step === 2) setStep(3);
                    else if (step === 3) setStep(4);
                    else if (step === 4) setStep(5);
                    else if (step === 5) setStep(6);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  <span>التالي</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleConfirmImport}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد الاستيراد وحفظ التلاميذ</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
