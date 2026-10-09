import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import {
  RotateCw,
  Users,
  Trophy,
  Volume2,
  VolumeX,
  RefreshCw,
  Check,
  Award,
  Sparkles,
} from 'lucide-react';

export const StudentWheel: React.FC = () => {
  const { classStudents, activeClass, showToast } = useApp();

  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [pickMode, setPickMode] = useState<'single' | 'groups'>('single');
  const [groupCount, setGroupCount] = useState<number>(4);
  const [generatedGroups, setGeneratedGroups] = useState<any[][]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationAngleRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Filter available students
  const availableStudents = classStudents.filter((s) => !excludedIds.includes(s.id));

  // Synthesize sound effects using Web Audio API
  const playChimeSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.45); // C6

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // Ignore if browser blocks auto-audio
    }
  };

  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {
      // Ignore
    }
  };

  // Draw the Wheel Canvas
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 10;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    if (availableStudents.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Cairo';
      ctx.textAlign = 'center';
      ctx.fillText('لا يوجد تلاميذ متاحون', cx, cy);
      return;
    }

    const sliceAngle = (2 * Math.PI) / availableStudents.length;
    const colors = [
      '#059669', '#10B981', '#047857', '#065F46',
      '#2563EB', '#3B82F6', '#1D4ED8',
      '#D97706', '#F59E0B', '#B45309',
      '#7C3AED', '#8B5CF6', '#6D28D9',
      '#DB2777', '#EC4899', '#BE185D',
    ];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotationAngleRef.current);

    availableStudents.forEach((student, i) => {
      const angle = i * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text inside slice
      ctx.save();
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Cairo, sans-serif';
      const label = `${student.firstName} ${student.lastName}`;
      ctx.fillText(label, radius - 20, 5);
      ctx.restore();
    });

    ctx.restore();

    // Center circular badge
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 12px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText('قسمي', cx, cy + 4);
  };

  useEffect(() => {
    drawWheel();
  }, [availableStudents]);

  // Spin Wheel Physics
  const spinWheel = () => {
    if (isSpinning || availableStudents.length === 0) return;

    setIsSpinning(true);
    setSelectedStudent(null);

    const totalRounds = 5 + Math.random() * 4; // 5 to 9 full spins
    const randomStopAngle = Math.random() * 2 * Math.PI;
    const finalAngle = rotationAngleRef.current + totalRounds * 2 * Math.PI + randomStopAngle;

    const duration = 4000; // 4 seconds
    const startTime = performance.now();
    const startAngle = rotationAngleRef.current;
    let lastTickTime = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      rotationAngleRef.current = startAngle + (finalAngle - startAngle) * easeOut;

      drawWheel();

      // Sound tick
      if (currentTime - lastTickTime > 80 && progress < 0.9) {
        playTickSound();
        lastTickTime = currentTime;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Calculate which slice ended at top pointer (angle = 3*PI/2)
        const sliceAngle = (2 * Math.PI) / availableStudents.length;
        const normalizedAngle = (2 * Math.PI - (rotationAngleRef.current % (2 * Math.PI))) % (2 * Math.PI);
        // The pointer is at angle 0 (3 o'clock) or 3*PI/2 (12 o'clock)
        const pointerAngle = (3 * Math.PI / 2) % (2 * Math.PI);
        const winningAngle = (pointerAngle - (rotationAngleRef.current % (2 * Math.PI)) + 4 * Math.PI) % (2 * Math.PI);
        const winningIndex = Math.floor(winningAngle / sliceAngle) % availableStudents.length;

        const winner = availableStudents[winningIndex] || availableStudents[0];
        setSelectedStudent(winner);
        setHistory((prev) => [winner, ...prev]);

        playChimeSound();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Divide into groups
  const generateRandomGroups = () => {
    const shuffled = [...classStudents].sort(() => 0.5 - Math.random());
    const groups: any[][] = Array.from({ length: groupCount }, () => []);
    shuffled.forEach((student, index) => {
      groups[index % groupCount].push(student);
    });
    setGeneratedGroups(groups);
    showToast(`تم توزيع تلاميذ القسم على ${groupCount} أفواج متوازنة`);
  };

  return (
    <div className="space-y-6">
      {/* Title & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>عجلة التلاميذ التفاعلية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            اختيار عشوائي عادل ومحفز للتلاميذ للمشاركة في الأنشطة والإجابة عن الأسئلة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-600'
                : 'border-slate-300 dark:border-slate-700 text-slate-400'
            }`}
            title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تفعيل المؤثرات الصوتية'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">المؤثرات الصوتية</span>
          </button>

          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setPickMode('single')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pickMode === 'single'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500'
              }`}
            >
              عجلة الحظ
            </button>
            <button
              onClick={() => setPickMode('groups')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pickMode === 'groups'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500'
              }`}
            >
              توزيع المجموعات
            </button>
          </div>
        </div>
      </div>

      {pickMode === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wheel canvas & Pointer */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative">
            {/* Top Pointer arrow */}
            <div className="absolute top-4 z-10 w-0 h-0 border-x-8 border-x-transparent border-t-16 border-t-amber-500 drop-shadow-md" />

            {/* Canvas */}
            <div className="relative my-4">
              <canvas
                ref={canvasRef}
                width={360}
                height={360}
                className="max-w-full aspect-square drop-shadow-md"
              />
            </div>

            {/* Spin CTA Button */}
            <div className="flex items-center gap-3 mt-2">
              <button
                disabled={isSpinning || availableStudents.length === 0}
                onClick={spinWheel}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50"
              >
                <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'جاري الدوران...' : 'أدر العجلة الآن!'}</span>
              </button>

              <button
                onClick={() => {
                  setExcludedIds([]);
                  setSelectedStudent(null);
                  showToast('تمت إعادة إدراج جميع التلاميذ في العجلة');
                }}
                className="p-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="إعادة ضبط واسترجاع المستبعدين"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Winner Announcement Card */}
            {selectedStudent && (
              <div className="mt-5 w-full max-w-md p-4 rounded-2xl bg-radial from-amber-500/15 via-emerald-500/10 to-transparent border border-amber-500/30 text-center animate-in zoom-in-95 duration-200">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>التلميذ الفائز بالمشاركة</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  رقم التسجيل: {selectedStudent.registrationNumber}
                </p>

                <div className="flex items-center justify-center gap-2 mt-3">
                  <button
                    onClick={() => {
                      setExcludedIds((prev) => [...prev, selectedStudent.id]);
                      setSelectedStudent(null);
                      showToast(`تم استبعاد ${selectedStudent.firstName} من الدورات القادمة`);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  >
                    استبعاد من السحوبات القادمة
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Available Students & History */}
          <div className="space-y-4">
            {/* Stats Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  التلاميذ في العجلة:
                </span>
                <span className="font-bold text-emerald-600">
                  {availableStudents.length} من أصل {classStudents.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  التلاميذ المستبعدون:
                </span>
                <span className="font-bold text-amber-600">{excludedIds.length}</span>
              </div>
            </div>

            {/* History list */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>سجل المختارين في هذه الحصة</span>
              </h4>

              {history.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  لم يتم اختيار أي تلميذ بعد
                </p>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {history.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {s.firstName} {s.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{s.registrationNumber}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Group generator view */
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  توزيع تلاميذ القسم إلى أفواج عمل تعاونية
                </h4>
                <p className="text-xs text-slate-500">
                  توزيع متوازن وعشوائي للأفواج التربوية لورشات العمل والمشاريع
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">عدد الأفواج:</span>
                <select
                  value={groupCount}
                  onChange={(e) => setGroupCount(Number(e.target.value))}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold"
                >
                  <option value={2}>فوجان (2)</option>
                  <option value={3}>3 أفواج</option>
                  <option value={4}>4 أفواج</option>
                  <option value={5}>5 أفواج</option>
                  <option value={6}>6 أفواج</option>
                </select>
              </div>

              <button
                onClick={generateRandomGroups}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>توزيع الأفواج الآن</span>
              </button>
            </div>
          </div>

          {/* Render Groups Grid */}
          {generatedGroups.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {generatedGroups.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h5 className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                      الفوج {gIdx + 1}
                    </h5>
                    <span className="text-xs text-slate-400 font-semibold">
                      {group.length} تلاميذ
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs divide-y divide-slate-50 dark:divide-slate-800/60">
                    {group.map((st, sIdx) => (
                      <li
                        key={st.id}
                        className="pt-1.5 flex items-center justify-between text-slate-700 dark:text-slate-300"
                      >
                        <span className="font-semibold">
                          {st.firstName} {st.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          #{st.registrationNumber}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
