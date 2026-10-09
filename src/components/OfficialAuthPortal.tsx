import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WILAYAS_ALGERIA } from '../data/mockData';
import {
  School,
  Lock,
  Mail,
  User,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  BookOpen,
  Award,
  Phone,
  Building,
  KeyRound,
  FileCheck,
  ChevronLeft,
  Sun,
  Moon,
  Globe,
  Check,
  AlertCircle,
  HelpCircle,
  LayoutDashboard,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { LiveClockWidget } from './LiveClockWidget';

interface OfficialAuthPortalProps {
  onBackToApp?: () => void;
}

export const OfficialAuthPortal: React.FC<OfficialAuthPortalProps> = ({ onBackToApp }) => {
  const {
    authView,
    setAuthView,
    loginTeacher,
    registerTeacher,
    enterDemoMode,
    user,
    setLanguage,
    updateUser,
    setShowAuthPortal,
    setShowActivationModal,
  } = useApp();

  // Form states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [nationalTeacherId, setNationalTeacherId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [wilaya, setWilaya] = useState<string>('19 - سطيف');
  const [dairaMunicipality, setDairaMunicipality] = useState<string>('سطيف المركز');
  const [school, setSchool] = useState<string>('مدرسة النجاح الابتدائية');
  const [teacherRank, setTeacherRank] = useState<string>('أستاذ المدرسة الابتدائية');
  const [academicYear, setAcademicYear] = useState<string>('2025/2026');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([
    'السنة الرابعة ابتدائي',
    'السنة الثانية ابتدائي',
  ]);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);

  // Recovery flow
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1);
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  // Password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showCharterModal, setShowCharterModal] = useState<boolean>(false);

  const currentYear = new Date().getFullYear();

  // Toggle grade selection
  const toggleGrade = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: 'فارغة', color: 'bg-slate-200 dark:bg-slate-700', score: 0 };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { label: 'ضعيفة', color: 'bg-red-500', score: 25 };
    if (score === 2) return { label: 'متوسطة', color: 'bg-amber-500', score: 50 };
    if (score === 3) return { label: 'جيدة جداً', color: 'bg-blue-500', score: 75 };
    return { label: 'قوية ومحمية', color: 'bg-emerald-600', score: 100 };
  };

  const strength = getPasswordStrength(password);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني أو رقم التعريف المهني للأستاذ');
      return;
    }

    if (!password) {
      setErrorMsg('يرجى كتابة كلمة المرور');
      return;
    }

    const success = loginTeacher(email, password);
    if (success && onBackToApp) {
      onBackToApp();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('يرجى كتابة الاسم واللقب الكامل للأستاذ');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني للتواصل وتفعيل الحساب');
      return;
    }

    if (!school.trim()) {
      setErrorMsg('يرجى إدخال اسم المدرسة الابتدائية');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('كلمة المرور وتأكيد كلمة المرور غير متطابقين');
      return;
    }

    if (selectedGrades.length === 0) {
      setErrorMsg('يرجى اختيار مستوى تعليمي واحد على الأقل من المستويات المسندة إليك');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('يرجى الموافقة على ميثاق الاستخدام البيداغوجي وسرية بيانات التمدرس');
      return;
    }

    registerTeacher(
      {
        fullName: fullName.trim(),
        email: email.trim(),
        nationalTeacherId: nationalTeacherId.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        wilaya,
        dairaMunicipality: dairaMunicipality.trim(),
        school: school.trim(),
        teacherRank,
        academicYear: academicYear.trim(),
        gradesTaught: selectedGrades,
      },
      password
    );

    if (onBackToApp) {
      onBackToApp();
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (recoveryStep === 1) {
      if (!email.trim()) {
        setErrorMsg('يرجى كتابة البريد الإلكتروني المسجل به الحساب أو رقم التعريف');
        return;
      }
      setRecoveryStep(2);
      setSuccessMsg('تم إرسال رمز التحقق (رمز تجريبي: 789456) إلى بريدك الإلكتروني بنجاح');
    } else if (recoveryStep === 2) {
      if (recoveryCode.trim() !== '789456' && recoveryCode.trim().length < 4) {
        setErrorMsg('رمز التحقق غير صحيح، يرجى كتابة الرمز 789456');
        return;
      }
      setRecoveryStep(3);
      setErrorMsg(null);
      setSuccessMsg('تم التحقق بنجاح. يرجى إدخال كلمة المرور الجديدة');
    } else {
      if (newPassword.length < 6) {
        setErrorMsg('كلمة المرور الجديدة يجب أن تحتوي على 6 أحرف على الأقل');
        return;
      }
      loginTeacher(email || 'ahmed.mohamed@qasami.dz', newPassword);
      if (onBackToApp) {
        onBackToApp();
      }
    }
  };

  const fillQuickDemo = (type: 'ahmed' | 'diche') => {
    if (type === 'ahmed') {
      setEmail('ahmed.mohamed@qasami.dz');
      setPassword('ahmed2025');
    } else {
      setEmail('diche2016@gmail.com');
      setPassword('diche2025');
    }
    setErrorMsg(null);
  };

  const toggleTheme = () => {
    const next = user.themeMode === 'dark' ? 'light' : 'dark';
    updateUser({ themeMode: next });
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. National Official Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-emerald-100 px-4 py-2 text-xs border-b border-emerald-800/80 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
          <div className="flex items-center gap-2 font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white">الجمهورية الجزائرية الديمقراطية الشعبية</span>
            <span className="text-emerald-300/80 hidden md:inline">—</span>
            <span className="text-emerald-200/90 hidden md:inline">وزارة التربية الوطنية</span>
            <span className="text-emerald-300/80 hidden lg:inline">—</span>
            <span className="text-amber-300 font-semibold hidden lg:inline">بوابة الأستاذ الموحدة</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {/* Algerian Flag subtle badge */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-700/60">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block border border-white/40" />
              <span className="text-emerald-100 font-mono">الجزائر</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-lg border border-white/15">
              <Globe className="w-3 h-3 text-emerald-300" />
              <button
                onClick={() => setLanguage('ar')}
                className={`px-1 rounded ${user.language === 'ar' ? 'font-bold text-amber-300' : 'text-emerald-200 hover:text-white'}`}
              >
                عربي
              </button>
              <span>|</span>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-1 rounded ${user.language === 'fr' ? 'font-bold text-amber-300' : 'text-emerald-200 hover:text-white'}`}
              >
                Fr
              </button>
            </div>

            {/* Dark / Light toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-colors"
              title={user.themeMode === 'dark' ? 'الوضع الفاتح' : 'الوضع الليلي'}
            >
              {user.themeMode === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-emerald-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Portal Header Nav */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <img
              src="/icon.svg"
              alt="قسمي"
              className="w-10 h-10 rounded-2xl shadow-md border border-emerald-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>قسمي</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    البوابة الرسمية
                  </span>
                </h1>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                مساعد معلم التعليم الابتدائي — فضاء الأستاذ الرقمي
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock on desktop */}
            <div className="hidden lg:block">
              <LiveClockWidget compactMobile={false} />
            </div>

            <PWAInstallButton compact />

            {/* Activation Code Button */}
            <button
              onClick={() => setShowActivationModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-xs"
              title="إدخال كود التفعيل"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">كود التفعيل</span>
            </button>

            {/* If user came from app or wants to return to workspace */}
            {user.isAuthenticated ? (
              <button
                onClick={() => {
                  setShowAuthPortal(false);
                  if (onBackToApp) onBackToApp();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                <span>لوحة التحكم ({user.fullName?.split(' ')[0] || 'أستاذ'})</span>
              </button>
            ) : null}

            {/* Instant Demo Launch Button */}
            <button
              onClick={() => {
                enterDemoMode();
                if (onBackToApp) onBackToApp();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 text-amber-800 dark:text-amber-200 text-xs font-bold transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">تجربة فورية</span>
              <span className="sm:hidden">تجربة</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Portal Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Top Notification Badge */}
        <div className="max-w-4xl mx-auto w-full mb-6 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>نظام تربوي آمن ومشفر لمعلمي وأساتذة المدارس الابتدائية بالجزائر</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {authView === 'login' && 'تسجيل الدخول إلى فضاء الأستاذ'}
            {authView === 'register' && 'إنشاء حساب رسمي جديد للأستاذ'}
            {authView === 'forgot' && 'استرجاع الحساب وكلمة المرور'}
            {authView === 'demo' && 'الفضاء التجريبي للأستاذ'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            منصة متكاملة لتنظيم الأقسام، متابعة التلاميذ، حساب المعدلات الفورية، إنشاء المذكرات والاختبارات وفق المنهاج الوزاري المعتمد.
          </p>
        </div>

        {/* Portal Main Card */}
        <div className="max-w-4xl mx-auto w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Left / Feature Showcase Panel */}
          <div className="md:w-5/12 bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Visual background lights */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-emerald-100 border border-white/15">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  <span>التعليم الابتدائي في الجزائر</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  كل ما يحتاجه المعلم في منصة واحدة
                </h3>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  صُممت المنصة بعناية لتراعي الخصوصية الميدانية للتعليم الابتدائي الجزائري مع استقلالية تامة لبيانات كل أستاذ.
                </p>
              </div>

              {/* 5 Official Features with Checkmarks */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 text-emerald-100/95">
                  <div className="p-1 rounded-lg bg-emerald-700/60 text-amber-300 shrink-0 mt-0.5 border border-emerald-600/50">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">استيراد قوائم التلاميذ</span>
                    <span className="text-[11px] text-emerald-200/80">
                      من ملفات Excel أو صور الكاميرا و PDF بخاصية التعرف الذكي (OCR).
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-emerald-100/95">
                  <div className="p-1 rounded-lg bg-emerald-700/60 text-amber-300 shrink-0 mt-0.5 border border-emerald-600/50">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">مذكرات واختبارات الجيل الثاني</span>
                    <span className="text-[11px] text-emerald-200/80">
                      صياغة الكفاءات الختامية ومركباتها ومؤشرات التقييم المعتمدة.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-emerald-100/95">
                  <div className="p-1 rounded-lg bg-emerald-700/60 text-amber-300 shrink-0 mt-0.5 border border-emerald-600/50">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">رصد العلامات والمعدلات</span>
                    <span className="text-[11px] text-emerald-200/80">
                      معاملات المواد، الرتب، وتقارير الأولياء الآلية بنقرة زر.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-emerald-100/95">
                  <div className="p-1 rounded-lg bg-emerald-700/60 text-amber-300 shrink-0 mt-0.5 border border-emerald-600/50">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">قرعة التلاميذ ومخطط الجلوس</span>
                    <span className="text-[11px] text-emerald-200/80">
                      عجلة الأسماء العادلة وتوزيع المقاعد بيداغوجياً داخل الحجرة.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Designer Signature Badge */}
            <div className="relative z-10 pt-6 mt-6 border-t border-emerald-700/60 space-y-2">
              <div className="rounded-2xl bg-white/10 p-3 border border-white/15 backdrop-blur-xs text-right">
                <span className="text-[10px] text-emerald-200/90 block">
                  إشراف وتطوير تربوي:
                </span>
                <span className="text-xs font-bold text-amber-300 block">
                  الأستاذ: ديش صلاح الدين
                </span>
                <span className="text-[10px] text-emerald-200/70 block mt-0.5">
                  من الميدان التربوي الجزائري لخدمة زملائي الأساتذة
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/70 text-center">
                قسمي © {currentYear} — جميع الحقوق محفوظة
              </p>
            </div>
          </div>

          {/* Right / Interactive Form Panel */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Tab Switcher Header */}
              <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 text-xs font-bold mb-6 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl transition-all ${
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
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl transition-all ${
                    authView === 'register'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  حساب أستاذ جديد
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthView('forgot');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setRecoveryStep(1);
                  }}
                  className={`py-2.5 px-3 rounded-xl transition-all ${
                    authView === 'forgot'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  استرجاع الحساب
                </button>
              </div>

              {/* Alert Feedback Messages */}
              {errorMsg && (
                <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300 font-semibold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ==================== 1. LOGIN FORM ==================== */}
              {authView === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
                      البريد الإلكتروني أو رقم التعريف المهني:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="teacher@qasami.dz أو رقم التعريف DZ-..."
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 ps-10 pe-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-700 dark:text-slate-300 font-semibold">
                        كلمة المرور:
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthView('forgot');
                          setErrorMsg(null);
                        }}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 ps-10 pe-10 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        تذكر بيانات الدخول في هذا الجهاز
                      </span>
                    </label>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>حماية 256-bit</span>
                    </div>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-99 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>الدخول إلى فضاء الأستاذ</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>

                  {/* Quick Demonstration Credentials Chips */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                      <span>حسابات سريعة للاختبار والتقييم:</span>
                      <span className="text-[10px] text-emerald-600">انقر للتعبئة الفورية</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => fillQuickDemo('ahmed')}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-800/50 text-right transition-colors"
                      >
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          الأستاذ أحمد محمد
                        </div>
                        <div className="text-[10px] text-slate-400">
                          مدرسة النجاح - س4 أ (28 تلميذاً)
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => fillQuickDemo('diche')}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-800/50 text-right transition-colors"
                      >
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          الأستاذ ديش صلاح الدين
                        </div>
                        <div className="text-[10px] text-slate-400">
                          مطور المنصة - ولاية سطيف
                        </div>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* ==================== 2. REGISTER FORM ==================== */}
              {authView === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                  {/* Step A: Personal Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        الاسم واللقب الكامل للأستاذ: <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="مثال: أحمد بن علي"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ps-9 pe-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        البريد الإلكتروني: <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="teacher@qasami.dz"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ps-9 pe-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step B: School & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        الولاية: <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={wilaya}
                        onChange={(e) => setWilaya(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      >
                        {WILAYAS_ALGERIA.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        البلدية أو الدائرة:
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={dairaMunicipality}
                          onChange={(e) => setDairaMunicipality(e.target.value)}
                          placeholder="مثال: سطيف المركز"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ps-9 pe-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        المدرسة الابتدائية: <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <School className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          placeholder="مثال: مدرسة النجاح الابتدائية"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ps-9 pe-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        الرتبة التربوية:
                      </label>
                      <select
                        value={teacherRank}
                        onChange={(e) => setTeacherRank(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="أستاذ المدرسة الابتدائية">أستاذ المدرسة الابتدائية</option>
                        <option value="أستاذ رئيسي للتعليم الابتدائي">أستاذ رئيسي للتعليم الابتدائي</option>
                        <option value="أستاذ مكون للتعليم الابتدائي">أستاذ مكون للتعليم الابتدائي</option>
                      </select>
                    </div>
                  </div>

                  {/* Grades Assigned */}
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
                      المستويات المسندة هذا الموسم (2025/2026): <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'السنة الأولى ابتدائي',
                        'السنة الثانية ابتدائي',
                        'السنة الثالثة ابتدائي',
                        'السنة الرابعة ابتدائي',
                        'السنة الخامسة ابتدائي',
                      ].map((grade) => {
                        const isSelected = selectedGrades.includes(grade);
                        return (
                          <button
                            type="button"
                            key={grade}
                            onClick={() => toggleGrade(grade)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {grade.replace(' ابتدائي', '')}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        كلمة المرور: <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ps-9 pe-9 py-2 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Strength bar */}
                      {password && (
                        <div className="mt-1.5 space-y-1">
                          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${strength.color} transition-all duration-300`}
                              style={{ width: `${strength.score}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>الأمان: {strength.label}</span>
                            <span>6+ أحرف</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        تأكيد كلمة المرور: <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ps-9 pe-9 py-2 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pedagogical Charter Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        أوافق على{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowCharterModal(true);
                          }}
                          className="text-emerald-600 dark:text-emerald-400 underline font-bold"
                        >
                          ميثاق الاستخدام البيداغوجي وسرية بيانات التمدرس
                        </button>{' '}
                        وأقر بالمسؤولية التربوية التامة عن صيانة خصوصية التلاميذ ونتائجهم.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-99 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-3"
                  >
                    <span>إنشاء الحساب وبدء العمل فوراً</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </form>
              )}

              {/* ==================== 3. FORGOT PASSWORD ==================== */}
              {authView === 'forgot' && (
                <form onSubmit={handleRecoverySubmit} className="space-y-4 text-xs">
                  {recoveryStep === 1 && (
                    <>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                        أدخل البريد الإلكتروني أو رقم التعريف المهني للأستاذ المسجل به الحساب، وسنرسل لك رمز تحقق فوري لاستعادة كلمة المرور:
                      </p>

                      <div>
                        <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
                          البريد الإلكتروني أو رقم التعريف:
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="teacher@qasami.dz"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ps-10 pe-3 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>إرسال رمز الاسترجاع</span>
                      </button>
                    </>
                  )}

                  {recoveryStep === 2 && (
                    <>
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300">
                        رمز التحقق التجريبي هو: <strong>789456</strong>
                      </div>

                      <div>
                        <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
                          أدخل رمز التحقق (6 أرقام):
                        </label>
                        <input
                          type="text"
                          required
                          value={recoveryCode}
                          onChange={(e) => setRecoveryCode(e.target.value)}
                          placeholder="789456"
                          className="w-full text-center tracking-widest text-base font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <span>تأكيد الرمز</span>
                      </button>
                    </>
                  )}

                  {recoveryStep === 3 && (
                    <>
                      <div>
                        <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
                          كلمة المرور الجديدة:
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ps-10 pe-10 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <span>حفظ كلمة المرور وتسجيل الدخول فورا</span>
                      </button>
                    </>
                  )}

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthView('login');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-emerald-600 hover:underline font-bold"
                    >
                      العودة لشاشة تسجيل الدخول
                    </button>
                  </div>
                </form>
              )}

              {/* Instant Demo Banner */}
              <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>تريد استكشاف النظام فوراً دون تسجيل؟</span>
                  </span>
                  <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                    مساحة نموذجية مستقلة
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  ادخل بنقرة واحدة بحساب الأستاذ التجريبي (قسم السنة الرابعة ابتدائي - 28 تلميذاً، مذكرات، شبكة علامات، ومخطط جلوس جاهز).
                </p>

                <button
                  type="button"
                  onClick={() => {
                    enterDemoMode();
                    if (onBackToApp) onBackToApp();
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-99 text-slate-950 font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>دخول فوري بحساب الأستاذ أحمد محمد (تجريبي)</span>
                </button>
              </div>
            </div>

            {/* Bottom Footer Details */}
            <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-1 text-center sm:text-right">
              <span>
                تصميم وتطوير الأستاذ: <strong className="text-slate-700 dark:text-slate-300">ديش صلاح الدين</strong>
              </span>
              <span className="text-[10px]">النسخة 2.5 — متوافقة مع متصفحات الهاتف والكمبيوتر</span>
            </div>
          </div>
        </div>
      </main>

      {/* Charter Modal Dialog */}
      {showCharterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>ميثاق الاستخدام البيداغوجي وسرية المعطيات</span>
              </h3>
              <button
                onClick={() => setShowCharterModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 max-h-72 overflow-y-auto leading-relaxed">
              <p>
                <strong>1. الأمان والخصوصية:</strong> جميع البيانات المدخلة في منصة «قسمي» (أسماء التلاميذ، التواريخ، الدرجات، والملاحظات التربوية) تخضع لمعايير السرية التامة وتُخزن في مساحة المعلم فقط.
              </p>
              <p>
                <strong>2. المرجعية البيداغوجية:</strong> تعتمد المنصة على مناهج وزارة التربية الوطنية للجيل الثاني، ومخططات التعلمات المخففة، ودليل تقييم المكتسبات لمرحلة التعليم الابتدائي.
              </p>
              <p>
                <strong>3. المسؤولية المهنية:</strong> يلتزم الأستاذ بالتحقق من دقة التقييمات المسجلة وعدم مشاركة بيانات الدخول مع أي أطراف غير مصرح لها.
              </p>
              <p>
                <strong>4. استقلالية البيانات:</strong> لا تتداخل بيانات أي أستاذ مع بيانات زميل آخر، وتبقى تحت الإشراف المباشر لصاحب الحساب.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setTermsAccepted(true);
                  setShowCharterModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                الموافقة والإغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
