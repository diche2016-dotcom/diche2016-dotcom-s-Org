import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WILAYAS_ALGERIA } from '../data/mockData';
import {
  School,
  Lock,
  Mail,
  User,
  X,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    showAuthPortal,
    setShowAuthPortal,
    authView,
    setAuthView,
    enterDemoMode,
    loginTeacher,
    registerTeacher,
    updateUser,
    showToast,
    user,
  } = useApp();

  // Form Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [nationalTeacherId, setNationalTeacherId] = useState<string>('');
  const [teacherRank, setTeacherRank] = useState<string>('أستاذ المدرسة الابتدائية');
  const [school, setSchool] = useState<string>('مدرسة النجاح الابتدائية');
  const [wilaya, setWilaya] = useState<string>('19 - سطيف');
  const [academicYear, setAcademicYear] = useState<string>('2025/2026');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([
    'السنة الرابعة ابتدائي',
  ]);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);

  // UI state
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const currentYear = new Date().getFullYear();

  // Toggle grade level selection
  const toggleGrade = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: 'bg-slate-200', score: 0 };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { label: 'ضعيفة', color: 'bg-red-500', score: 25 };
    if (score === 2) return { label: 'متوسطة', color: 'bg-amber-500', score: 50 };
    if (score === 3) return { label: 'جيدة', color: 'bg-blue-500', score: 75 };
    return { label: 'قوية ومحمية', color: 'bg-emerald-600', score: 100 };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (authView === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('يرجى إدخال الاسم واللقب الكامل للأستاذ');
        return;
      }
      if (!email.trim()) {
        setErrorMsg('يرجى إدخال البريد الإلكتروني للتواصل وتفعيل الحساب');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('كلمة المرور يجب أن تتكون من 6 أحرف على الأقل');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('كلمة المرور وتأكيدها غير متطابقين');
        return;
      }
      if (!termsAccepted) {
        setErrorMsg('يرجى الموافقة على ميثاق الاستخدام البيداغوجي وسرية البيانات');
        return;
      }

      registerTeacher(
        {
          email: email.trim(),
          fullName: fullName.trim(),
          nationalTeacherId: nationalTeacherId.trim() || undefined,
          teacherRank,
          school: school.trim(),
          wilaya,
          academicYear,
          gradesTaught: selectedGrades,
        },
        password
      );
      setShowAuthModal(false);
    } else if (authView === 'login') {
      if (!email.trim() || !password) {
        setErrorMsg('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      loginTeacher(email, password);
      setShowAuthModal(false);
    } else {
      // Forgot password
      if (!email.trim()) {
        setErrorMsg('يرجى كتابة البريد الإلكتروني لاستعادة الحساب');
        return;
      }
      showToast('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح');
      setAuthView('login');
    }
  };

  const handleLaunchDemo = () => {
    enterDemoMode();
    setShowAuthModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Close Modal Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 start-4 z-20 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
          title="إغلاق النافذة"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Right / Side Showcase Panel (Desktop Split View) */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-8 flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

          {/* Top Brand & Official Seal */}
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-emerald-100 border border-white/15 backdrop-blur-xs">
              <School className="w-3.5 h-3.5" />
              <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src="/icon.svg"
                alt="قسمي"
                className="w-12 h-12 rounded-2xl shadow-md border border-white/20"
              />
              <div>
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>قسمي</span>
                  <span className="text-[10px] font-bold bg-amber-400/90 text-slate-900 px-2 py-0.5 rounded-full">
                    الرسمي
                  </span>
                </h2>
                <p className="text-xs text-emerald-200/90 font-medium">
                  مساعد معلم التعليم الابتدائي
                </p>
              </div>
            </div>

            <p className="text-xs text-emerald-100/80 leading-relaxed pt-2">
              الفضاء الرقمي الموحد لإدارة القسم، متابعة التلاميذ، إنشاء المذكرات والاختبارات، وتحليل النتائج.
            </p>

            {/* Official Feature Points */}
            <div className="space-y-2.5 pt-4 text-xs">
              <div className="flex items-start gap-2.5 text-emerald-100/90">
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>استيراد قوائم التلاميذ من Excel و الصور بكاميرا الهاتف (OCR)</span>
              </div>
              <div className="flex items-start gap-2.5 text-emerald-100/90">
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>مذكرات واختبارات وفق منهاج الجيل الثاني المخفف المعتمد</span>
              </div>
              <div className="flex items-start gap-2.5 text-emerald-100/90">
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>رصد العلامات، حساب المعدلات الفورية، وتقارير الأولياء الآلية</span>
              </div>
              <div className="flex items-start gap-2.5 text-emerald-100/90">
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>توقيت حي للجزائر العاصمة والتقويمان الميلادي والهجري</span>
              </div>
            </div>
          </div>

          {/* Bottom Designer & Official Credential Box */}
          <div className="relative z-10 pt-6 border-t border-emerald-700/60 space-y-2 text-right">
            <div className="rounded-xl bg-white/10 p-3 border border-white/15 backdrop-blur-xs">
              <p className="text-[10px] text-emerald-200 leading-tight">
                تصميم وتطوير المنصة:
              </p>
              <p className="text-xs font-bold text-amber-300 mt-0.5">
                الأستاذ: ديش صلاح الدين
              </p>
              <p className="text-[10px] text-emerald-200/80 mt-1">
                من الميدان التربوي الجزائري لخدمة معلمي التعليم الابتدائي
              </p>
            </div>
            <p className="text-[10px] text-emerald-300/70 text-center">
              © {currentYear} قسمي — خصوصية وأمان تام لبيانات الأستاذ
            </p>
          </div>
        </div>

        {/* Left / Main Authentication Form Pane */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Mobile Header Title */}
            <div className="md:hidden text-center space-y-1 mb-5">
              <div className="flex items-center justify-center gap-2">
                <img src="/icon.svg" alt="قسمي" className="w-8 h-8 rounded-xl" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  قسمي — مساعد معلم الابتدائي
                </h3>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                بوابة الدخول الرسمية لفضاء الأستاذ
              </p>
            </div>

            {/* Mode Tabs */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 text-xs font-bold mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthView('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  authView === 'login'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthView('register');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  authView === 'register'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                إنشاء حساب أستاذ جديد
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-700 dark:text-red-300 font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* REGISTER ONLY FIELDS */}
              {authView === 'register' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        الاسم واللقب الكامل للأستاذ:
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="مثال: أحمد بن علي"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 ps-9 pe-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        الولاية:
                      </label>
                      <select
                        value={wilaya}
                        onChange={(e) => setWilaya(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      >
                        {WILAYAS_ALGERIA.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        المدرسة الابتدائية:
                      </label>
                      <div className="relative">
                        <School className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          placeholder="مثال: مدرسة النجاح الابتدائية"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 ps-9 pe-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        السنة الدراسية:
                      </label>
                      <input
                        type="text"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Grades Selection */}
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
                      المستويات المسندة إليك هذا الموسم:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'السنة الأولى ابتدائي',
                        'السنة الثانية ابتدائي',
                        'السنة الثالثة ابتدائي',
                        'السنة الرابعة ابتدائي',
                        'السنة الخامسة ابتدائي',
                      ].map((gr) => {
                        const isSelected = selectedGrades.includes(gr);
                        return (
                          <button
                            type="button"
                            key={gr}
                            onClick={() => toggleGrade(gr)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {isSelected && '✓ '}
                            {gr.replace(' ابتدائي', '')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* EMAIL FIELD (LOGIN & REGISTER & FORGOT) */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  البريد الإلكتروني أو رقم التعريف:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@qasami.dz"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 ps-9 pe-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* PASSWORD FIELD (LOGIN & REGISTER) */}
              {authView !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">
                      كلمة المرور:
                    </label>
                    {authView === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthView('forgot');
                          setErrorMsg(null);
                        }}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 ps-9 pe-10 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator for Registration */}
                  {authView === 'register' && password && (
                    <div className="mt-1.5 space-y-1">
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>مستوى الأمان: {strength.label}</span>
                        <span>يُفضل 8 أحرف وأرقام</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CONFIRM PASSWORD (REGISTER ONLY) */}
              {authView === 'register' && (
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    تأكيد كلمة المرور:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 ps-9 pe-10 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Checkboxes */}
              {authView === 'login' ? (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      تذكر بياناتي في هذا الجهاز
                    </span>
                  </label>
                </div>
              ) : authView === 'register' ? (
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      أوافق على ميثاق الاستخدام البيداغوجي وأقر بالمسؤولية التامة عن سرية بيانات التلاميذ ونتائجهم وفق القوانين المعمول بها.
                    </span>
                  </label>
                </div>
              ) : null}

              {/* Primary Action Button */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-99 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>
                  {authView === 'login'
                    ? 'دخول إلى فضاء الأستاذ'
                    : authView === 'register'
                    ? 'تأكيد إنشاء الحساب وبدء الاستخدام'
                    : 'إرسال رابط استعادة كلمة المرور'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </form>

            {/* Back to Login link if in Forgot view */}
            {authView === 'forgot' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-emerald-600 hover:underline font-bold"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            )}

            {/* INSTANT DEMO MODE CARD */}
            <div className="mt-5 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>تريد تجربة التطبيق فوراً؟</span>
                </span>
                <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-200/50 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                  دون الحاجة لحساب
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                ادخل بنقرة واحدة بحساب الأستاذ التجريبي (قسم السنة الرابعة ابتدائي - 28 تلميذاً، مذكرات، ونتائج جاهزة للاختبار).
              </p>

              <button
                type="button"
                onClick={handleLaunchDemo}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>دخول فوري بحساب تجريبي واقعي</span>
              </button>
            </div>
          </div>

          {/* Bottom Designer Attribution for all devices */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-1 text-center sm:text-right">
            <span>
              تصميم وتطوير الأستاذ: <strong className="text-slate-700 dark:text-slate-300">ديش صلاح الدين</strong>
            </span>
            <span className="text-[10px]">قسمي © {currentYear}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
