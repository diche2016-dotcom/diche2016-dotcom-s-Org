import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  KeyRound,
  Sparkles,
  Copy,
  Check,
  MessageCircle,
  Share2,
  Download,
  Trash2,
  X,
  Plus,
  ShieldCheck,
  Award,
  Calendar,
  Users,
  Search,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  generateActivationCode,
  getStoredActivationCodes,
  saveCodeToStorage,
  buildWhatsAppShareText,
  CODES_STORAGE_KEY,
} from '../utils/license';
import { ActivationCode, LicenseType } from '../types';

export const LicenseGeneratorModal: React.FC = () => {
  const {
    showCodeGeneratorModal,
    setShowCodeGeneratorModal,
    activateAccountWithCode,
    showToast,
  } = useApp();

  const [codesList, setCodesList] = useState<ActivationCode[]>([]);
  const [selectedType, setSelectedType] = useState<LicenseType>('annual');
  const [recipientName, setRecipientName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customCodeInput, setCustomCodeInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  // Latest generated code highlight
  const [latestCode, setLatestCode] = useState<ActivationCode | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (showCodeGeneratorModal) {
      setCodesList(getStoredActivationCodes());
    }
  }, [showCodeGeneratorModal]);

  if (!showCodeGeneratorModal) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    if (showCustomInput && customCodeInput.trim()) {
      // Add custom manual code
      const customCode: ActivationCode = {
        id: `code-custom-${Date.now()}`,
        code: customCodeInput.trim().toUpperCase(),
        type: selectedType,
        createdAt: new Date().toISOString(),
        generatedFor: recipientName.trim() || undefined,
        isUsed: false,
        notes: notes.trim() || 'كود مخصص يدوي',
      };
      saveCodeToStorage(customCode);
      setLatestCode(customCode);
      setCodesList(getStoredActivationCodes());
      setCustomCodeInput('');
      setShowCustomInput(false);
      showToast(`تم إنشاء الكود المخصص: ${customCode.code}`);
      return;
    }

    const generated: ActivationCode[] = [];
    for (let i = 0; i < quantity; i++) {
      const code = generateActivationCode(
        selectedType,
        quantity === 1 ? recipientName : `${recipientName} (#${i + 1})`,
        notes
      );
      generated.push(code);
    }

    setLatestCode(generated[0]);
    setCodesList(getStoredActivationCodes());
    setRecipientName('');
    setNotes('');
    setQuantity(1);
    showToast(`تم توليد ${generated.length} كود تفعيل بنجاح!`);
  };

  const handleCopyCode = (codeStr: string, id: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedId(id);
    showToast(`تم نسخ الكود: ${codeStr}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyWhatsAppMsg = (code: ActivationCode) => {
    const text = buildWhatsAppShareText(code);
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    showToast('تم نسخ رسالة الواتساب الجاهزة للإرسال للأستاذ!');
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleDeleteCode = (id: string) => {
    const updated = codesList.filter((c) => c.id !== id);
    setCodesList(updated);
    localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(updated));
    if (latestCode?.id === id) setLatestCode(null);
    showToast('تم حذف الكود من السجل');
  };

  const handleExportCodes = () => {
    const text = codesList
      .map(
        (c) =>
          `الكود: ${c.code} | النوع: ${c.type} | المستفيد: ${c.generatedFor || 'غير محدد'} | الحالة: ${
            c.isUsed ? 'مستخدم' : 'متاح'
          } | تاريخ التوليد: ${new Date(c.createdAt).toLocaleDateString('ar-DZ')}`
      )
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qasami-activation-codes-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    showToast('تم تصدير قائمة الأكواد في ملف نصي');
  };

  const filteredCodes = codesList.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      (c.generatedFor && c.generatedFor.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-950 text-white flex items-center justify-between border-b border-emerald-800/60 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  لوحة المسؤول
                </span>
                <span className="text-xs text-emerald-200 font-semibold">
                  الأستاذ: ديش صلاح الدين
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                مولد وتسيير أكواد التفعيل (قسمي)
              </h2>
            </div>
          </div>

          <button
            onClick={() => setShowCodeGeneratorModal(false)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Top Form: Generator */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>توليد كود تفعيل جديد</span>
              </h3>

              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-xs text-emerald-600 hover:underline font-semibold"
              >
                {showCustomInput ? 'العودة للتوليد التلقائي' : '+ إدخال كود مخصص يدوي'}
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Type Selection */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    نوع الترخيص:
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as LicenseType)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="annual">ترخيص سنوي (موسم 2025/2026)</option>
                    <option value="lifetime">ترخيص دائم مدى الحياة (VIP)</option>
                    <option value="extended_30d">تمديد تجريبي إضافي (30 يوماً)</option>
                  </select>
                </div>

                {/* Recipient */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    المستفيد (اسم الأستاذ / المدرسة):
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="مثال: الأستاذ أحمد بن علي"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Quantity or Custom Code */}
                {showCustomInput ? (
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      الكود المخصص:
                    </label>
                    <input
                      type="text"
                      value={customCodeInput}
                      onChange={(e) => setCustomCodeInput(e.target.value)}
                      placeholder="مثال: AHMED-VIP-2026"
                      className="w-full uppercase font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      عدد الأكواد:
                    </label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value={1}>1 كود واحد</option>
                      <option value={3}>3 أكواد دفعة واحدة</option>
                      <option value={5}>5 أكواد دفعة واحدة</option>
                      <option value={10}>10 أكواد دفعة واحدة</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات إضافية (مثال: تم التواصل عبر واتساب / ولاية سطيف)..."
                  className="w-2/3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                />

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>توليد الكود الآن</span>
                </button>
              </div>
            </form>
          </div>

          {/* Newly Generated Code Highlight Box */}
          {latestCode && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-slate-900 border-2 border-emerald-500/50 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم إنشاء الكود بنجاح وهو جاهز للإرسال:</span>
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                  {latestCode.type === 'lifetime'
                    ? 'ترخيص دائم مدى الحياة'
                    : latestCode.type === 'annual'
                    ? 'ترخيص سنوي 2025/2026'
                    : 'تمديد تجريبي 30 يوماً'}
                </span>
              </div>

              {/* Code Box */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base sm:text-lg font-black tracking-widest text-emerald-700 dark:text-emerald-300 select-all">
                    {latestCode.code}
                  </span>
                  {latestCode.generatedFor && (
                    <span className="text-[11px] text-slate-500">
                      (مخصص لـ: {latestCode.generatedFor})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(latestCode.code, latestCode.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {copiedId === latestCode.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === latestCode.id ? 'تم النسخ' : 'نسخ الكود'}</span>
                  </button>

                  <button
                    onClick={() => handleCopyWhatsAppMsg(latestCode)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    title="نسخ رسالة كاملة منسقة مع الكود وتعليمات التفعيل لإرسالها بالواتساب"
                  >
                    {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{copiedMsg ? 'تم نسخ الرسالة' : 'رسالة الواتساب'}</span>
                  </button>

                  <button
                    onClick={() => activateAccountWithCode(latestCode.code)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                    title="تجربة تفعيل هذا الجهاز بالكود فوراً"
                  >
                    <span>تفعيل الجهاز به</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stored Codes Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  سجل الأكواد المُولّدة ({filteredCodes.length}):
                </h4>
                <button
                  onClick={handleExportCodes}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير ملف</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في الأكواد أو الأسماء..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 ps-9 pe-3 py-1.5 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            {filteredCodes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                لا توجد أكواد مطابقة.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">الكود</th>
                      <th className="py-2.5 px-3">النوع</th>
                      <th className="py-2.5 px-3">المستفيد</th>
                      <th className="py-2.5 px-3">تاريخ التوليد</th>
                      <th className="py-2.5 px-3">الحالة</th>
                      <th className="py-2.5 px-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredCodes.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white select-all">
                          {item.code}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.type === 'lifetime'
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              : item.type === 'annual'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}>
                            {item.type === 'lifetime' ? 'دائم مدى الحياة' : item.type === 'annual' ? 'سنوي 2025/2026' : 'تمديد 30 يوماً'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          {item.generatedFor || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                          {new Date(item.createdAt).toLocaleDateString('ar-DZ')}
                        </td>
                        <td className="py-2.5 px-3">
                          {item.isUsed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                              <CheckCircle2 className="w-3 h-3 text-slate-400" />
                              <span>مُستخدَم {item.usedBy ? `(${item.usedBy})` : ''}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>متاح للتفعيل</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleCopyCode(item.code, item.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                              title="نسخ الكود"
                            >
                              {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleCopyWhatsAppMsg(item)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 transition-colors"
                              title="نسخ رسالة الواتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteCode(item.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition-colors"
                              title="حذف الكود"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            الأكواد المُولّدة متوافقة حسابياً وتعمل فورياً على متصفح أو تطبيق أي أستاذ.
          </span>
          <button
            onClick={() => setShowCodeGeneratorModal(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
