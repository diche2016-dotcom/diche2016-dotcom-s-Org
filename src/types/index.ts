export type Language = 'ar' | 'fr' | 'en';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeColor = 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  school: string;
  wilaya: string;
  academicYear: string;
  gradesTaught: string[];
  nationalTeacherId?: string;
  teacherRank?: string;
  dairaMunicipality?: string;
  phoneNumber?: string;
  avatar?: string;
  language: Language;
  themeMode: ThemeMode;
  themeColor: ThemeColor;
  timeFormat: '24h' | '12h';
  hijriOffset: number; // e.g. -2, -1, 0, +1, +2
  showDesignerCredit: boolean;
  showFooter: boolean;
  isDemoUser: boolean;
  isAuthenticated?: boolean;
  license?: LicenseInfo;
}

export type SubscriptionStatus = 'trial' | 'active' | 'expired';

export type LicenseType = 'trial_10d' | 'annual' | 'lifetime' | 'extended_30d';

export interface LicenseInfo {
  status: SubscriptionStatus;
  trialStartDate: string; // ISO date string
  trialDaysTotal: number; // default 10 days
  trialDaysRemaining: number;
  isActivated: boolean;
  licenseType: LicenseType;
  activationCode?: string;
  activatedAt?: string;
  expiresAt?: string; // e.g. for annual license
}

export interface ActivationCode {
  id: string;
  code: string;
  type: LicenseType;
  createdAt: string;
  generatedFor?: string; // Teacher or school name
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
  notes?: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g., "السنة الرابعة ابتدائي - قسم أ"
  gradeLevel: string; // "السنة 1", "السنة 2", etc.
  academicYear: string;
  school: string;
  studentCount: number;
  notes?: string;
  color?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  classId: string;
  registrationNumber: string;
  lastName: string;
  firstName: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'M' | 'F';
  parentName?: string;
  parentPhone?: string;
  notes?: string;
  avatarUrl?: string;
  behaviorScore: number; // 1-5
  stars: number;
  points: number;
  badges: string[];
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late';
  period: 'morning' | 'afternoon';
  reason?: string;
}

export interface Subject {
  id: string;
  name: string;
  nameFr?: string;
  coefficient: number;
  gradeLevels: string[];
  color: string;
}

export interface Assessment {
  id: string;
  classId: string;
  subjectId: string;
  title: string;
  term: 'term1' | 'term2' | 'term3';
  type: 'exam' | 'test' | 'continuous' | 'diagnostic';
  skill?: string;
  date: string;
  maxScore: number;
  notes?: string;
}

export interface StudentGrade {
  id: string;
  assessmentId: string;
  studentId: string;
  score: number;
  notes?: string;
}

export interface LessonPlan {
  id: string;
  subject: string;
  gradeLevel: string;
  domain: string;
  section: string;
  title: string;
  content: {
    header: {
      subject: string;
      gradeLevel: string;
      domain: string;
      section: string;
      lessonTitle: string;
      competence: string;
      components: string;
      indicators: string;
      materials: string;
      duration: string;
    };
    stages: Array<{
      stageName: string;
      duration: string;
      teacherActivity: string;
      studentActivity: string;
      assessment: string;
    }>;
    summary: string;
    remedialActivity: string;
    enrichmentActivity: string;
    homework: string;
  };
  createdAt: string;
}

export interface ExamQuestion {
  id: number;
  type: string;
  text: string;
  options?: string[];
  points: number;
  modelAnswer: string;
  gradingCriteria?: string;
}

export interface GeneratedExam {
  id: string;
  examTitle: string;
  gradeLevel: string;
  subject: string;
  topic: string;
  duration: string;
  totalPoints: number;
  instructions: string;
  questions: ExamQuestion[];
  modelAnswerSummary: string;
  createdAt: string;
}

export interface DeskPosition {
  id: string;
  row: number;
  col: number;
  studentId?: string;
}

export interface SeatingLayout {
  id: string;
  classId: string;
  name: string;
  layoutType: 'rows' | 'groups' | 'u-shape';
  rows: number;
  cols: number;
  desks: DeskPosition[];
  updatedAt: string;
}

export interface ParentReport {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  reportType: 'brief' | 'detailed' | 'monthly' | 'trimester' | 'annual';
  date: string;
  title: string;
  greeting: string;
  generalAssessment: string;
  highlights: string[];
  areasForImprovement: string[];
  homeRecommendations: string[];
  closing: string;
  fullLetterText: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: 'lesson' | 'exam' | 'activity' | 'homework' | 'meeting' | 'task';
  classId?: string;
  description?: string;
  completed?: boolean;
}

export interface LibraryItem {
  id: string;
  title: string;
  category: 'lesson_plan' | 'exam' | 'activity' | 'document' | 'worksheet';
  subject?: string;
  gradeLevel?: string;
  createdAt: string;
  content: any;
}

export interface ImportLog {
  id: string;
  date: string;
  fileName: string;
  className: string;
  totalRows: number;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorsCount: number;
}
