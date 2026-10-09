import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  ClassRoom,
  Student,
  Subject,
  Assessment,
  StudentGrade,
  AttendanceRecord,
  LessonPlan,
  GeneratedExam,
  SeatingLayout,
  CalendarEvent,
  LibraryItem,
  ImportLog,
  Language,
  ThemeMode,
  ThemeColor,
  LicenseInfo,
  LicenseType,
} from '../types';
import {
  calculateTrialDaysRemaining,
  verifyActivationCode,
  markCodeAsUsed,
} from '../utils/license';
import confetti from 'canvas-confetti';
import {
  INITIAL_USER,
  INITIAL_CLASSES,
  PRIMARY_SUBJECTS,
  INITIAL_STUDENTS_CLASS1,
  INITIAL_ASSESSMENTS,
  INITIAL_GRADES,
  INITIAL_LESSON_PLAN,
} from '../data/mockData';
import { translations } from '../i18n';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: UserProfile;
  updateUser: (fields: Partial<UserProfile>) => void;
  classes: ClassRoom[];
  activeClassId: string;
  setActiveClassId: (id: string) => void;
  activeClass: ClassRoom | undefined;
  addClass: (cls: Omit<ClassRoom, 'id' | 'createdAt'>) => ClassRoom;
  updateClass: (id: string, cls: Partial<ClassRoom>) => void;
  deleteClass: (id: string) => void;

  students: Student[];
  classStudents: Student[];
  addStudent: (s: Omit<Student, 'id' | 'createdAt' | 'stars' | 'points' | 'badges'>) => Student;
  updateStudent: (id: string, s: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  bulkAddStudents: (newStudents: Partial<Student>[], classId: string, options?: { skipDuplicates?: boolean; updateExisting?: boolean }) => { added: number; updated: number; skipped: number };

  attendance: AttendanceRecord[];
  classAttendance: AttendanceRecord[];
  setStudentAttendance: (studentId: string, date: string, status: 'present' | 'absent' | 'late', period?: 'morning' | 'afternoon') => void;
  markAllPresentForDate: (classId: string, date: string, period?: 'morning' | 'afternoon') => void;

  subjects: Subject[];
  assessments: Assessment[];
  classAssessments: Assessment[];
  addAssessment: (ass: Omit<Assessment, 'id'>) => Assessment;
  grades: StudentGrade[];
  updateGrade: (assessmentId: string, studentId: string, score: number) => void;

  lessonPlans: LessonPlan[];
  addLessonPlan: (plan: LessonPlan) => void;
  deleteLessonPlan: (id: string) => void;

  exams: GeneratedExam[];
  addExam: (exam: GeneratedExam) => void;
  deleteExam: (id: string) => void;

  seatingLayouts: SeatingLayout[];
  saveSeatingLayout: (layout: SeatingLayout) => void;

  events: CalendarEvent[];
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;

  libraryItems: LibraryItem[];
  addLibraryItem: (item: Omit<LibraryItem, 'id' | 'createdAt'>) => void;

  importLogs: ImportLog[];
  addImportLog: (log: Omit<ImportLog, 'id'>) => void;

  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Language & i18n
  t: (key: keyof typeof translations.ar) => string;
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;

  // Demo Mode
  isDemoMode: boolean;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  resetDemoData: () => void;

  // Auth screen trigger
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showAuthPortal: boolean;
  setShowAuthPortal: (show: boolean) => void;
  authView: 'login' | 'register' | 'forgot' | 'demo';
  setAuthView: (v: 'login' | 'register' | 'forgot' | 'demo') => void;
  loginTeacher: (emailOrId: string, password?: string) => boolean;
  registerTeacher: (data: Partial<UserProfile>, password?: string) => void;
  logoutTeacher: () => void;

  // License & 10-day trial
  license: LicenseInfo;
  isTrialExpired: boolean;
  showActivationModal: boolean;
  setShowActivationModal: (show: boolean) => void;
  showCodeGeneratorModal: boolean;
  setShowCodeGeneratorModal: (show: boolean) => void;
  activateAccountWithCode: (code: string) => { success: boolean; message: string };
  testSetTrialDaysRemaining: (days: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence keys
  const USER_KEY = 'qasami_user';
  const CLASSES_KEY = 'qasami_classes';
  const STUDENTS_KEY = 'qasami_students';
  const ATTENDANCE_KEY = 'qasami_attendance';
  const ASSESSMENTS_KEY = 'qasami_assessments';
  const GRADES_KEY = 'qasami_grades';
  const LESSONS_KEY = 'qasami_lessons';
  const EXAMS_KEY = 'qasami_exams';
  const SEATING_KEY = 'qasami_seating';
  const EVENTS_KEY = 'qasami_events';
  const LIBRARY_KEY = 'qasami_library';
  const IMPORT_LOGS_KEY = 'qasami_import_logs';
  const DEMO_MODE_KEY = 'qasami_is_demo';

  // State initialization with localStorage fallback
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(USER_KEY);
    const parsed: UserProfile = saved ? JSON.parse(saved) : INITIAL_USER;
    if (!parsed.license) {
      parsed.license = {
        status: 'trial',
        trialStartDate: new Date().toISOString(),
        trialDaysTotal: 10,
        trialDaysRemaining: 10,
        isActivated: false,
        licenseType: 'trial_10d',
      };
    } else if (!parsed.license.isActivated) {
      const remaining = calculateTrialDaysRemaining(
        parsed.license.trialStartDate,
        parsed.license.trialDaysTotal || 10
      );
      parsed.license.trialDaysRemaining = remaining;
      parsed.license.status = remaining > 0 ? 'trial' : 'expired';
    }
    return parsed;
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem(CLASSES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [activeClassId, setActiveClassId] = useState<string>(() => {
    return classes[0]?.id || 'class-1';
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STUDENTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS_CLASS1;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(ATTENDANCE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [subjects] = useState<Subject[]>(PRIMARY_SUBJECTS);

  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem(ASSESSMENTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENTS;
  });

  const [grades, setGrades] = useState<StudentGrade[]>(() => {
    const saved = localStorage.getItem(GRADES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });

  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(() => {
    const saved = localStorage.getItem(LESSONS_KEY);
    return saved ? JSON.parse(saved) : [INITIAL_LESSON_PLAN];
  });

  const [exams, setExams] = useState<GeneratedExam[]>(() => {
    const saved = localStorage.getItem(EXAMS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [seatingLayouts, setSeatingLayouts] = useState<SeatingLayout[]>(() => {
    const saved = localStorage.getItem(SEATING_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(EVENTS_KEY);
    return saved ? JSON.parse(saved) : [
      { id: 'ev-1', title: 'تقويم الرياضيات - الحساب', date: new Date().toISOString().split('T')[0], time: '09:00', type: 'exam', classId: 'class-1' },
      { id: 'ev-2', title: 'نشاط بيئي: تشجير ساحة المدرسة', date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], time: '14:00', type: 'activity', classId: 'class-1' },
    ];
  });

  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(() => {
    const saved = localStorage.getItem(LIBRARY_KEY);
    return saved ? JSON.parse(saved) : [
      { id: 'lib-1', title: 'مذكرة الفاعل وعلامة رفعه', category: 'lesson_plan', subject: 'اللغة العربية', gradeLevel: 'السنة الرابعة ابتدائي', createdAt: '2025-10-05', content: INITIAL_LESSON_PLAN },
    ];
  });

  const [importLogs, setImportLogs] = useState<ImportLog[]>(() => {
    const saved = localStorage.getItem(IMPORT_LOGS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem(DEMO_MODE_KEY) !== 'false';
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showAuthPortal, setShowAuthPortal] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot' | 'demo'>('login');
  const [showActivationModal, setShowActivationModal] = useState<boolean>(false);
  const [showCodeGeneratorModal, setShowCodeGeneratorModal] = useState<boolean>(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem(GRADES_KEY, JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessonPlans));
  }, [lessonPlans]);

  useEffect(() => {
    localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(SEATING_KEY, JSON.stringify(seatingLayouts));
  }, [seatingLayouts]);

  useEffect(() => {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(libraryItems));
  }, [libraryItems]);

  useEffect(() => {
    localStorage.setItem(IMPORT_LOGS_KEY, JSON.stringify(importLogs));
  }, [importLogs]);

  useEffect(() => {
    localStorage.setItem(DEMO_MODE_KEY, String(isDemoMode));
  }, [isDemoMode]);

  // Apply document direction and theme class
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('dir', user.language === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', user.language);

    if (user.themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [user.language, user.themeMode]);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // i18n Translation helper
  const t = (key: keyof typeof translations.ar): string => {
    const lang = user.language;
    const dict = translations[lang] || translations.ar;
    return (dict as any)[key] || (translations.ar as any)[key] || String(key);
  };

  const setLanguage = (lang: Language) => {
    updateUser({ language: lang });
  };

  const updateUser = (fields: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...fields }));
  };

  // Active Class computation
  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === activeClassId);
  const classAttendance = attendance.filter((a) => a.classId === activeClassId);
  const classAssessments = assessments.filter((a) => a.classId === activeClassId);

  // Class Management CRUD
  const addClass = (cls: Omit<ClassRoom, 'id' | 'createdAt'>) => {
    const newClass: ClassRoom = {
      ...cls,
      id: `class-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setClasses((prev) => [...prev, newClass]);
    setActiveClassId(newClass.id);
    showToast(`تم إنشاء القسم "${newClass.name}" بنجاح`);
    return newClass;
  };

  const updateClass = (id: string, updated: Partial<ClassRoom>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    showToast('تم تحديث بيانات القسم بنجاح');
  };

  const deleteClass = (id: string) => {
    if (classes.length <= 1) {
      showToast('لا يمكن حذف القسم الأخير في النظام', 'error');
      return;
    }
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setStudents((prev) => prev.filter((s) => s.classId !== id));
    setActiveClassId(classes.filter((c) => c.id !== id)[0].id);
    showToast('تم حذف القسم وقائمته');
  };

  // Student CRUD
  const addStudent = (s: Omit<Student, 'id' | 'createdAt' | 'stars' | 'points' | 'badges'>) => {
    const newStudent: Student = {
      ...s,
      id: `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stars: 0,
      points: 0,
      badges: [],
      createdAt: new Date().toISOString(),
    };
    setStudents((prev) => [...prev, newStudent]);
    // update student count in class
    setClasses((prev) =>
      prev.map((c) => (c.id === s.classId ? { ...c, studentCount: c.studentCount + 1 } : c))
    );
    showToast(`تمت إضافة التلميذ ${newStudent.firstName} ${newStudent.lastName}`);
    return newStudent;
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    showToast('تم تحديث ملف التلميذ');
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    if (target) {
      setClasses((prev) =>
        prev.map((c) => (c.id === target.classId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c))
      );
    }
    showToast('تم حذف التلميذ من القسم');
  };

  // Bulk Import Students with Duplicate Management
  const bulkAddStudents = (
    newRows: Partial<Student>[],
    targetClassId: string,
    options: { skipDuplicates?: boolean; updateExisting?: boolean } = { skipDuplicates: true }
  ) => {
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const existingInClass = students.filter((s) => s.classId === targetClassId);

    const updatedStudentsList = [...students];

    newRows.forEach((row) => {
      // Duplicate detection by registrationNumber or (lastName + firstName)
      const existingIndex = updatedStudentsList.findIndex(
        (s) =>
          s.classId === targetClassId &&
          ((row.registrationNumber && s.registrationNumber === row.registrationNumber) ||
            (s.lastName.trim().toLowerCase() === (row.lastName || '').trim().toLowerCase() &&
              s.firstName.trim().toLowerCase() === (row.firstName || '').trim().toLowerCase()))
      );

      if (existingIndex >= 0) {
        if (options.updateExisting) {
          updatedStudentsList[existingIndex] = {
            ...updatedStudentsList[existingIndex],
            ...row,
          };
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        const newStudent: Student = {
          id: `s-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          classId: targetClassId,
          registrationNumber: row.registrationNumber || String(existingInClass.length + addedCount + 1).padStart(2, '0'),
          lastName: row.lastName || '',
          firstName: row.firstName || '',
          birthDate: row.birthDate || '2016-01-01',
          gender: row.gender === 'F' ? 'F' : 'M',
          parentName: row.parentName || '',
          parentPhone: row.parentPhone || '',
          notes: row.notes || '',
          behaviorScore: 5,
          stars: 0,
          points: 0,
          badges: [],
          createdAt: new Date().toISOString(),
        };
        updatedStudentsList.push(newStudent);
        addedCount++;
      }
    });

    setStudents(updatedStudentsList);

    // Update class count
    const totalInClass = updatedStudentsList.filter((s) => s.classId === targetClassId).length;
    setClasses((prev) => prev.map((c) => (c.id === targetClassId ? { ...c, studentCount: totalInClass } : c)));

    return { added: addedCount, updated: updatedCount, skipped: skippedCount };
  };

  // Attendance Management
  const setStudentAttendance = (
    studentId: string,
    date: string,
    status: 'present' | 'absent' | 'late',
    period: 'morning' | 'afternoon' = 'morning'
  ) => {
    setAttendance((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.studentId === studentId && a.date === date && a.period === period
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], status };
        return updated;
      } else {
        const newRec: AttendanceRecord = {
          id: `att-${Date.now()}-${studentId}`,
          studentId,
          classId: activeClassId,
          date,
          status,
          period,
        };
        return [...prev, newRec];
      }
    });
  };

  const markAllPresentForDate = (
    classId: string,
    date: string,
    period: 'morning' | 'afternoon' = 'morning'
  ) => {
    const classS = students.filter((s) => s.classId === classId);
    setAttendance((prev) => {
      const filtered = prev.filter(
        (a) => !(a.classId === classId && a.date === date && a.period === period)
      );
      const newBatch: AttendanceRecord[] = classS.map((s) => ({
        id: `att-${Date.now()}-${s.id}`,
        studentId: s.id,
        classId,
        date,
        status: 'present',
        period,
      }));
      return [...filtered, ...newBatch];
    });
    showToast('تم تسجيل جميع التلاميذ حاضرين بنجاح');
  };

  // Assessments & Grades
  const addAssessment = (ass: Omit<Assessment, 'id'>) => {
    const newAss: Assessment = {
      ...ass,
      id: `ass-${Date.now()}`,
    };
    setAssessments((prev) => [...prev, newAss]);
    showToast(`تم إنشاء التقويم "${newAss.title}"`);
    return newAss;
  };

  const updateGrade = (assessmentId: string, studentId: string, score: number) => {
    setGrades((prev) => {
      const existingIdx = prev.findIndex(
        (g) => g.assessmentId === assessmentId && g.studentId === studentId
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], score };
        return updated;
      } else {
        return [...prev, { id: `g-${Date.now()}`, assessmentId, studentId, score }];
      }
    });
  };

  // Lesson Plans
  const addLessonPlan = (plan: LessonPlan) => {
    setLessonPlans((prev) => [plan, ...prev]);
    showToast('تم حفظ المذكرة التربوية في مكتبتك');
  };

  const deleteLessonPlan = (id: string) => {
    setLessonPlans((prev) => prev.filter((p) => p.id !== id));
    showToast('تم حذف المذكرة');
  };

  // Exams
  const addExam = (exam: GeneratedExam) => {
    setExams((prev) => [exam, ...prev]);
    showToast('تم حفظ نموذج الاختبار');
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    showToast('تم حذف الاختبار');
  };

  // Seating
  const saveSeatingLayout = (layout: SeatingLayout) => {
    setSeatingLayouts((prev) => {
      const filtered = prev.filter((l) => l.id !== layout.id);
      return [...filtered, layout];
    });
    showToast('تم حفظ مخطط جلوس القسم بنجاح');
  };

  // Events
  const addEvent = (e: Omit<CalendarEvent, 'id'>) => {
    const newEv: CalendarEvent = { ...e, id: `ev-${Date.now()}` };
    setEvents((prev) => [...prev, newEv]);
    showToast('تمت إضافة الموعد إلى التقويم');
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Library
  const addLibraryItem = (item: Omit<LibraryItem, 'id' | 'createdAt'>) => {
    const newItem: LibraryItem = {
      ...item,
      id: `lib-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLibraryItems((prev) => [newItem, ...prev]);
    showToast('تمت إضافة المورد إلى مكتبتي');
  };

  // Import Log
  const addImportLog = (log: Omit<ImportLog, 'id'>) => {
    const newLog: ImportLog = { ...log, id: `log-${Date.now()}` };
    setImportLogs((prev) => [newLog, ...prev]);
  };

  // Accounts storage key
  const ACCOUNTS_KEY = 'qasami_registered_accounts';

  const loginTeacher = (emailOrId: string, password?: string): boolean => {
    const cleanIdentifier = emailOrId.trim().toLowerCase();
    
    // Check registered accounts
    const savedAccountsJson = localStorage.getItem(ACCOUNTS_KEY);
    const savedAccounts: UserProfile[] = savedAccountsJson ? JSON.parse(savedAccountsJson) : [];
    
    const matched = savedAccounts.find(
      (acc) =>
        acc.email.toLowerCase() === cleanIdentifier ||
        (acc.nationalTeacherId && acc.nationalTeacherId.toLowerCase() === cleanIdentifier)
    );

    if (matched) {
      setUser({ ...matched, isAuthenticated: true, isDemoUser: false });
      setShowAuthModal(false);
      setShowAuthPortal(false);
      showToast(`مرحباً بعودتك أستاذ(ة) ${matched.fullName}`);
      return true;
    }

    // Check if demo user
    if (
      cleanIdentifier === 'ahmed.mohamed@qasami.dz' ||
      cleanIdentifier === 'dz-2025-041982' ||
      cleanIdentifier.includes('ahmed')
    ) {
      enterDemoMode();
      setShowAuthModal(false);
      setShowAuthPortal(false);
      return true;
    }

    // Check if designer profile
    if (cleanIdentifier === 'diche2016@gmail.com' || cleanIdentifier.includes('diche')) {
      const dicheUser: UserProfile = {
        ...INITIAL_USER,
        id: 'teacher-diche',
        email: 'diche2016@gmail.com',
        fullName: 'الأستاذ: ديش صلاح الدين',
        school: 'مدرسة الشهداء الابتدائية',
        wilaya: '19 - سطيف',
        dairaMunicipality: 'سطيف المركز',
        teacherRank: 'أستاذ رئيسي للتعليم الابتدائي',
        nationalTeacherId: 'DZ-19-009841',
        isDemoUser: false,
        isAuthenticated: true,
        license: {
          status: 'active',
          trialStartDate: new Date().toISOString(),
          trialDaysTotal: 10,
          trialDaysRemaining: 10,
          isActivated: true,
          licenseType: 'lifetime',
          activatedAt: new Date().toISOString(),
          activationCode: 'DICHE-2026-PRO',
        },
      };
      setUser(dicheUser);
      setShowAuthModal(false);
      setShowAuthPortal(false);
      showToast('أهلاً بك أستاذ ديش صلاح الدين (مطور المنصة).');
      return true;
    }

    // Allow sign in with provided identifier
    const defaultName = cleanIdentifier.includes('@')
      ? cleanIdentifier.split('@')[0]
      : 'أستاذ التعليم الابتدائي';
    const newUser: UserProfile = {
      ...INITIAL_USER,
      id: `teacher-${Date.now()}`,
      email: cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@qasami.dz`,
      fullName: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
      isDemoUser: false,
      isAuthenticated: true,
      license: {
        status: 'trial',
        trialStartDate: new Date().toISOString(),
        trialDaysTotal: 10,
        trialDaysRemaining: 10,
        isActivated: false,
        licenseType: 'trial_10d',
      },
    };
    setUser(newUser);
    setShowAuthModal(false);
    setShowAuthPortal(false);
    showToast(`مرحباً بك أستاذ(ة) في فضاء قسمي الرسمي`);
    return true;
  };

  const registerTeacher = (data: Partial<UserProfile>, password?: string) => {
    const newTeacher: UserProfile = {
      ...user,
      ...data,
      id: `teacher-${Date.now()}`,
      email: data.email?.trim() || `teacher-${Date.now()}@qasami.dz`,
      fullName: data.fullName?.trim() || 'أستاذ مدرسة ابتدائية',
      school: data.school?.trim() || 'المدرسة الابتدائية',
      wilaya: data.wilaya || '19 - سطيف',
      academicYear: data.academicYear || '2025/2026',
      gradesTaught: data.gradesTaught || ['السنة الرابعة ابتدائي'],
      teacherRank: data.teacherRank || 'أستاذ المدرسة الابتدائية',
      nationalTeacherId: data.nationalTeacherId || `DZ-${Math.floor(100000 + Math.random() * 900000)}`,
      dairaMunicipality: data.dairaMunicipality || 'وسط المدينة',
      isDemoUser: false,
      isAuthenticated: true,
      license: {
        status: 'trial',
        trialStartDate: new Date().toISOString(),
        trialDaysTotal: 10,
        trialDaysRemaining: 10,
        isActivated: false,
        licenseType: 'trial_10d',
      },
    };

    // Save to registered accounts list
    try {
      const savedAccountsJson = localStorage.getItem(ACCOUNTS_KEY);
      const savedAccounts: UserProfile[] = savedAccountsJson ? JSON.parse(savedAccountsJson) : [];
      savedAccounts.push(newTeacher);
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(savedAccounts));
    } catch (e) {
      console.error(e);
    }

    setUser(newTeacher);
    setShowAuthModal(false);
    setShowAuthPortal(false);
    showToast(`تم إنشاء حساب الأستاذ(ة) ${newTeacher.fullName} بنجاح في المنصة الرسمية!`);
  };

  const logoutTeacher = () => {
    setUser((prev) => ({
      ...prev,
      isAuthenticated: false,
    }));
    setShowAuthPortal(true);
    showToast('تم تسجيل الخروج بنجاح. فضاء قسمي يرحب بك دائماً.', 'info');
  };

  // License calculations & handlers
  const license: LicenseInfo = user.license || {
    status: 'trial',
    trialStartDate: new Date().toISOString(),
    trialDaysTotal: 10,
    trialDaysRemaining: 10,
    isActivated: false,
    licenseType: 'trial_10d',
  };

  const isTrialExpired = !license.isActivated && license.trialDaysRemaining <= 0;

  const activateAccountWithCode = (codeStr: string): { success: boolean; message: string } => {
    const result = verifyActivationCode(codeStr);
    if (!result.valid) {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }

    const updatedLicense: LicenseInfo = {
      status: 'active',
      isActivated: true,
      licenseType: result.type,
      activationCode: codeStr.trim().toUpperCase(),
      activatedAt: new Date().toISOString(),
      trialStartDate: license.trialStartDate,
      trialDaysTotal: 10,
      trialDaysRemaining: 10,
      expiresAt: result.type === 'annual' ? '2026-06-30' : undefined,
    };

    updateUser({ license: updatedLicense });
    markCodeAsUsed(codeStr, user.fullName);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    showToast(`تهانينا! تم تفعيل حسابك بنجاح (${result.label})`);
    setShowActivationModal(false);
    return { success: true, message: result.message };
  };

  const testSetTrialDaysRemaining = (days: number) => {
    const currentLicense = user.license || {
      status: 'trial',
      trialStartDate: new Date().toISOString(),
      trialDaysTotal: 10,
      trialDaysRemaining: 10,
      isActivated: false,
      licenseType: 'trial_10d',
    };

    const updatedLicense: LicenseInfo = {
      ...currentLicense,
      isActivated: false, // force trial state so user can test expiration
      trialDaysRemaining: days,
      status: days > 0 ? 'trial' : 'expired',
    };

    updateUser({ license: updatedLicense });
    showToast(`تم ضبط أيام التجربة المتبقية إلى: ${days} أيام (${days <= 0 ? 'انتهت التجربة' : 'نشطة'})`);
  };

  // Demo Mode Switchers
  const enterDemoMode = () => {
    setIsDemoMode(true);
    setUser({
      ...INITIAL_USER,
      isAuthenticated: true,
      isDemoUser: true,
      license: {
        status: 'trial',
        trialStartDate: new Date(Date.now() - 3 * 86400000).toISOString(),
        trialDaysTotal: 10,
        trialDaysRemaining: 7,
        isActivated: false,
        licenseType: 'trial_10d',
      },
    });
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS_CLASS1);
    setAssessments(INITIAL_ASSESSMENTS);
    setGrades(INITIAL_GRADES);
    setActiveClassId('class-1');
    setShowAuthModal(false);
    setShowAuthPortal(false);
    showToast('أنت الآن في وضع التجربة المستقلة ببيانات نموذجية');
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    setUser({
      ...INITIAL_USER,
      id: 'teacher-custom',
      email: '',
      fullName: 'أستاذ جديد',
      school: 'مدرستي الابتدائية',
      isDemoUser: false,
      isAuthenticated: true,
    });
    showToast('تم الانتقال إلى مساحة العمل الخاصة بك');
  };

  const resetDemoData = () => {
    localStorage.clear();
    setUser(INITIAL_USER);
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS_CLASS1);
    setAssessments(INITIAL_ASSESSMENTS);
    setGrades(INITIAL_GRADES);
    setLessonPlans([INITIAL_LESSON_PLAN]);
    setActiveClassId('class-1');
    showToast('تمت إعادة ضبط البيانات النموذجية بنجاح');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        classes,
        activeClassId,
        setActiveClassId,
        activeClass,
        addClass,
        updateClass,
        deleteClass,
        students,
        classStudents,
        addStudent,
        updateStudent,
        deleteStudent,
        bulkAddStudents,
        attendance,
        classAttendance,
        setStudentAttendance,
        markAllPresentForDate,
        subjects,
        assessments,
        classAssessments,
        addAssessment,
        grades,
        updateGrade,
        lessonPlans,
        addLessonPlan,
        deleteLessonPlan,
        exams,
        addExam,
        deleteExam,
        seatingLayouts,
        saveSeatingLayout,
        events,
        addEvent,
        deleteEvent,
        libraryItems,
        addLibraryItem,
        importLogs,
        addImportLog,
        toasts,
        showToast,
        removeToast,
        t,
        currentLanguage: user.language,
        setLanguage,
        isDemoMode,
        enterDemoMode,
        exitDemoMode,
        resetDemoData,
        showAuthModal,
        setShowAuthModal,
        showAuthPortal,
        setShowAuthPortal,
        authView,
        setAuthView,
        loginTeacher,
        registerTeacher,
        logoutTeacher,
        license,
        isTrialExpired,
        showActivationModal,
        setShowActivationModal,
        showCodeGeneratorModal,
        setShowCodeGeneratorModal,
        activateAccountWithCode,
        testSetTrialDaysRemaining,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
