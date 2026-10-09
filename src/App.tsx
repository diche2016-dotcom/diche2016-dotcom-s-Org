import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { ClassesView } from './components/ClassesView';
import { StudentsView } from './components/StudentsView';
import { AttendanceView } from './components/AttendanceView';
import { GradesView } from './components/GradesView';
import { LessonPlanner } from './components/LessonPlanner';
import { ExamGenerator } from './components/ExamGenerator';
import { StudentWheel } from './components/StudentWheel';
import { SeatingPlanner } from './components/SeatingPlanner';
import { EducationalGames } from './components/EducationalGames';
import { ParentReports } from './components/ParentReports';
import { PlanningView } from './components/PlanningView';
import { LibraryView } from './components/LibraryView';
import { AIAssistantChat } from './components/AIAssistantChat';
import { SettingsView } from './components/SettingsView';
import { AboutApp } from './components/AboutApp';
import { LandingPage } from './components/LandingPage';
import { ImportStudentsModal } from './components/ImportStudentsModal';
import { ExportStudentsModal } from './components/ExportStudentsModal';
import { NewClassModal } from './components/NewClassModal';
import { AuthModal } from './components/AuthModal';
import { OfficialAuthPortal } from './components/OfficialAuthPortal';
import { TrialBanner } from './components/TrialBanner';
import { ActivationModal } from './components/ActivationModal';
import { LicenseGeneratorModal } from './components/LicenseGeneratorModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    user,
    setActiveClassId,
    toasts,
    removeToast,
    setShowAuthModal,
    showAuthPortal,
    setShowAuthPortal,
    setAuthView,
    enterDemoMode,
  } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Modals state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showNewClassModal, setShowNewClassModal] = useState<boolean>(false);
  const [modalTargetClassId, setModalTargetClassId] = useState<string | undefined>(undefined);

  // Landing page toggle: if user has logged out (e.g. no email and not demo)
  const [showLanding, setShowLanding] = useState<boolean>(false);

  const handleOpenImport = (classId?: string) => {
    setModalTargetClassId(classId);
    setShowImportModal(true);
  };

  const handleOpenExport = (classId?: string) => {
    setModalTargetClassId(classId);
    setShowExportModal(true);
  };

  // If user requested the full-page official portal or is logged out
  if (showAuthPortal) {
    return <OfficialAuthPortal onBackToApp={() => setShowAuthPortal(false)} />;
  }

  if (showLanding) {
    return (
      <LandingPage
        onStart={() => {
          setShowLanding(false);
          setShowAuthPortal(true);
        }}
        onTryDemo={() => {
          setShowLanding(false);
          enterDemoMode();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Trial & License Notice Banner */}
          <TrialBanner />

          {/* Header */}
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onOpenNewClassModal={() => setShowNewClassModal(true)}
          />

          {/* Dynamic Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenImportModal={() => handleOpenImport()}
              />
            )}

            {currentTab === 'classes' && (
              <ClassesView
                onSelectClassAndTab={(clsId, tab) => {
                  setActiveClassId(clsId);
                  setCurrentTab(tab);
                }}
                onOpenImportModalForClass={(clsId) => handleOpenImport(clsId)}
                onOpenExportModalForClass={(clsId) => handleOpenExport(clsId)}
              />
            )}

            {currentTab === 'students' && (
              <StudentsView
                onOpenImportModal={() => handleOpenImport()}
                onOpenExportModal={() => handleOpenExport()}
              />
            )}

            {currentTab === 'attendance' && (
              <AttendanceView onOpenExportModal={() => handleOpenExport()} />
            )}

            {currentTab === 'grades' && <GradesView />}

            {currentTab === 'lesson_plans' && <LessonPlanner />}

            {currentTab === 'exams' && <ExamGenerator />}

            {currentTab === 'wheel' && <StudentWheel />}

            {currentTab === 'seating' && <SeatingPlanner />}

            {currentTab === 'games' && <EducationalGames />}

            {currentTab === 'parent_reports' && <ParentReports />}

            {currentTab === 'planning' && <PlanningView />}

            {currentTab === 'library' && <LibraryView />}

            {currentTab === 'ai_assistant' && <AIAssistantChat />}

            {currentTab === 'settings' && <SettingsView />}

            {currentTab === 'about' && <AboutApp />}
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Global Modals */}
      <ImportStudentsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        defaultClassId={modalTargetClassId}
      />

      <ExportStudentsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      <NewClassModal
        isOpen={showNewClassModal}
        onClose={() => setShowNewClassModal(false)}
      />

      <AuthModal />
      <ActivationModal />
      <LicenseGeneratorModal />

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 start-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold backdrop-blur-md border animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'error'
                ? 'bg-red-900/90 text-white border-red-700'
                : toast.type === 'info'
                ? 'bg-blue-900/90 text-white border-blue-700'
                : 'bg-emerald-900/95 text-white border-emerald-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-300" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 text-blue-300" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
