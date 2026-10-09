import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SeatingLayout, DeskPosition } from '../types';
import {
  Armchair,
  Sparkles,
  Save,
  RotateCcw,
  Users,
  Grid,
  Check,
  Plus,
  Trash2,
  Shuffle,
} from 'lucide-react';

export const SeatingPlanner: React.FC = () => {
  const {
    activeClass,
    classStudents,
    seatingLayouts,
    saveSeatingLayout,
    showToast,
  } = useApp();

  const currentClassLayouts = seatingLayouts.filter((l) => l.classId === activeClass?.id);

  // Initialize or pick layout
  const [rows, setRows] = useState<number>(4);
  const [cols, setCols] = useState<number>(7);
  const [layoutName, setLayoutName] = useState<string>('مخطط الصفوف التقليدي');

  // Desks state
  const [desks, setDesks] = useState<DeskPosition[]>(() => {
    const initial: DeskPosition[] = [];
    let studentIdx = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 7; c++) {
        initial.push({
          id: `desk-${r}-${c}`,
          row: r,
          col: c,
          studentId: classStudents[studentIdx]?.id,
        });
        studentIdx++;
      }
    }
    return initial;
  });

  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null);

  // Switch students between two desks
  const handleDeskClick = (deskId: string) => {
    if (!selectedDeskId) {
      setSelectedDeskId(deskId);
    } else if (selectedDeskId === deskId) {
      setSelectedDeskId(null);
    } else {
      // Swap pupils
      setDesks((prev) => {
        const copy = [...prev];
        const deskA = copy.find((d) => d.id === selectedDeskId);
        const deskB = copy.find((d) => d.id === deskId);
        if (deskA && deskB) {
          const tempStudent = deskA.studentId;
          deskA.studentId = deskB.studentId;
          deskB.studentId = tempStudent;
        }
        return copy;
      });
      setSelectedDeskId(null);
      showToast('تم تبديل مقعدي التلميذين بنجاح');
    }
  };

  // Auto Arrange: Alphabetical
  const arrangeAlphabetical = () => {
    const sortedStudents = [...classStudents].sort((a, b) =>
      a.lastName.localeCompare(b.lastName, 'ar')
    );
    setDesks((prev) =>
      prev.map((desk, idx) => ({
        ...desk,
        studentId: sortedStudents[idx]?.id,
      }))
    );
    showToast('تم ترتيب المقاعد أبجدياً حسب اللقب');
  };

  // Auto Arrange: Random
  const arrangeRandom = () => {
    const shuffled = [...classStudents].sort(() => 0.5 - Math.random());
    setDesks((prev) =>
      prev.map((desk, idx) => ({
        ...desk,
        studentId: shuffled[idx]?.id,
      }))
    );
    showToast('تمت إعادة ترتيب المقاعد عشوائياً');
  };

  // Auto Arrange: Gender Balanced (Boy/Girl alternate)
  const arrangeBalanced = () => {
    const boys = classStudents.filter((s) => s.gender === 'M');
    const girls = classStudents.filter((s) => s.gender === 'F');
    const balanced: any[] = [];
    const maxLen = Math.max(boys.length, girls.length);
    for (let i = 0; i < maxLen; i++) {
      if (boys[i]) balanced.push(boys[i]);
      if (girls[i]) balanced.push(girls[i]);
    }
    setDesks((prev) =>
      prev.map((desk, idx) => ({
        ...desk,
        studentId: balanced[idx]?.id,
      }))
    );
    showToast('تم ترتيب المقاعد بنمط ثنائي متوازن');
  };

  // Save layout
  const handleSaveLayout = () => {
    if (!activeClass) return;
    const newLayout: SeatingLayout = {
      id: `layout-${Date.now()}`,
      classId: activeClass.id,
      name: layoutName,
      layoutType: 'rows',
      rows,
      cols,
      desks,
      updatedAt: new Date().toISOString(),
    };
    saveSeatingLayout(newLayout);
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Armchair className="w-5 h-5 text-emerald-600" />
            <span>مخطط جلوس القسم ({activeClass?.name})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            توزيع المقاعد والطاولات — اضغط على مقعدين لتبديل التلميذين بينهما
          </p>
        </div>

        {/* Auto Arrange & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              onClick={arrangeAlphabetical}
              className="px-2.5 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-semibold transition-colors"
            >
              أبجدي
            </button>
            <button
              onClick={arrangeRandom}
              className="px-2.5 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-semibold transition-colors"
            >
              عشوائي
            </button>
            <button
              onClick={arrangeBalanced}
              className="px-2.5 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-semibold transition-colors"
            >
              متوازن
            </button>
          </div>

          <button
            onClick={handleSaveLayout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>حفظ المخطط</span>
          </button>
        </div>
      </div>

      {/* Teacher Platform & Chalkboard Banner */}
      <div className="w-full py-2 rounded-xl bg-slate-800 dark:bg-slate-950 text-white text-center text-xs font-bold tracking-wider shadow-inner">
        السبورة ومنصة الأستاذ
      </div>

      {/* Classroom Desk Grid */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <div
          className="grid gap-3 min-w-[700px] mx-auto justify-center"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(90px, 1fr))`,
          }}
        >
          {desks.map((desk) => {
            const student = classStudents.find((s) => s.id === desk.studentId);
            const isSelected = selectedDeskId === desk.id;

            return (
              <div
                key={desk.id}
                onClick={() => handleDeskClick(desk.id)}
                className={`cursor-pointer rounded-xl p-2.5 text-center transition-all duration-150 select-none border-2 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500 shadow-md scale-105'
                    : student
                    ? student.gender === 'F'
                      ? 'border-pink-200 dark:border-pink-900/50 bg-pink-50/40 dark:bg-pink-950/20 hover:border-pink-400'
                      : 'border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 hover:border-blue-400'
                    : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto text-[10px] font-bold shadow-xs mb-1">
                  {desk.row + 1}-{desk.col + 1}
                </div>

                {student ? (
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {student.firstName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {student.lastName}
                    </p>
                    <span className="text-[9px] font-mono text-slate-400">
                      #{student.registrationNumber}
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 py-2">مقعد شاغر</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 flex items-center justify-between">
        <span>
          💡 نصيحة: انقر فوق مقعد التلميذ الأول، ثم انقر فوق المقعد الثاني لتبديل مكانيهما فوراً.
        </span>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> ذكور
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block" /> إناث
          </span>
        </div>
      </div>
    </div>
  );
};
