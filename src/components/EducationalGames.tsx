import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Gamepad2,
  Trophy,
  Star,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EducationalGames: React.FC = () => {
  const { classStudents, updateStudent, showToast } = useApp();

  const [activeGame, setActiveGame] = useState<'math' | 'truefalse' | 'sentence' | 'memory'>('math');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(classStudents[0]?.id || '');

  // Mental Math State
  const [num1, setNum1] = useState<number>(7);
  const [num2, setNum2] = useState<number>(8);
  const [operator, setOperator] = useState<'+' | '-' | '×'>('×');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [mathFeedback, setMathFeedback] = useState<string | null>(null);

  // True/False state
  const tfQuestions = [
    { q: 'الجزائر هي أكبر دولة في إفريقيا من حيث المساحة.', a: true },
    { q: 'الفاعل في اللغة العربية يكون دائماً مجروراً.', a: false },
    { q: 'مجموع زوايا المثلث هو 180 درجة.', a: true },
    { q: 'عملية الضرب تبديلية.', a: true },
    { q: 'النبات الأخضر لا يحتاج إلى الضوء للقيام بالتركيب الضوئي.', a: false },
  ];
  const [tfIndex, setTfIndex] = useState<number>(0);
  const [tfFeedback, setTfFeedback] = useState<string | null>(null);

  // Sentence ordering state
  const sentenceWords = ['المُعَلِّمُ', 'يَشْرَحُ', 'الدَّرْسَ', 'بِإِخْلَاصٍ', 'فِي', 'القِسْمِ'];
  const [shuffledWords, setShuffledWords] = useState<string[]>([
    'بِإِخْلَاصٍ', 'يَشْرَحُ', 'فِي', 'المُعَلِّمُ', 'القِسْمِ', 'الدَّرْسَ'
  ]);
  const [constructedWords, setConstructedWords] = useState<string[]>([]);

  // Reward points to selected student
  const rewardCurrentStudent = (points: number, stars: number = 1) => {
    const student = classStudents.find((s) => s.id === selectedStudentId);
    if (!student) return;

    updateStudent(student.id, {
      points: (student.points || 0) + points,
      stars: (student.stars || 0) + stars,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    showToast(`أحسنت! نال التلميذ ${student.firstName} +${points} نقطة و ⭐ نجمة تشجيع`);
  };

  // Math submission
  const checkMathAnswer = () => {
    let expected = 0;
    if (operator === '+') expected = num1 + num2;
    else if (operator === '-') expected = num1 - num2;
    else if (operator === '×') expected = num1 * num2;

    if (parseInt(userAnswer) === expected) {
      setMathFeedback('correct');
      rewardCurrentStudent(10, 1);
    } else {
      setMathFeedback('incorrect');
    }
  };

  const nextMathProblem = () => {
    const ops: Array<'+' | '-' | '×'> = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    setOperator(op);
    if (op === '×') {
      setNum1(Math.floor(Math.random() * 9) + 2);
      setNum2(Math.floor(Math.random() * 9) + 2);
    } else {
      setNum1(Math.floor(Math.random() * 50) + 10);
      setNum2(Math.floor(Math.random() * 40) + 5);
    }
    setUserAnswer('');
    setMathFeedback(null);
  };

  // True/False answer
  const answerTrueFalse = (val: boolean) => {
    const currentQ = tfQuestions[tfIndex];
    if (currentQ.a === val) {
      setTfFeedback('correct');
      rewardCurrentStudent(5, 1);
    } else {
      setTfFeedback('incorrect');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-emerald-600" />
            <span>الأنشطة والألعاب التعليمية والتحفيز الصفّي</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            مسابقات صفية محفزة للرياضيات واللغة العربية مع نظام مكافآت ونقاط فوري
          </p>
        </div>

        {/* Selected Student Reward Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">التلميذ المتسابق:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-bold text-slate-900 dark:text-white"
          >
            {classStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName} (⭐ {s.stars || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveGame('math')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors ${
            activeGame === 'math'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>تحدي الحساب السريع</span>
        </button>

        <button
          onClick={() => setActiveGame('truefalse')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors ${
            activeGame === 'truefalse'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>مسابقة صح أم خطأ</span>
        </button>

        <button
          onClick={() => setActiveGame('sentence')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors ${
            activeGame === 'sentence'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>ترتيب الجمل المفيدة</span>
        </button>
      </div>

      {/* Active Game Canvas */}
      {activeGame === 'math' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>حساب ذهني مباشر على السبورة</span>
          </div>

          <div className="text-4xl sm:text-5xl font-black font-mono text-slate-900 dark:text-white tracking-widest py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            {num1} {operator} {num2} = ?
          </div>

          <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="اكتب النتيجة..."
              className="text-center font-mono text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 w-36"
              onKeyDown={(e) => e.key === 'Enter' && checkMathAnswer()}
            />
            <button
              onClick={checkMathAnswer}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
            >
              تحقق!
            </button>
          </div>

          {mathFeedback === 'correct' && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>إجابة صحيحة وممتازة! أحسنت! (+10 نقاط)</span>
            </div>
          )}

          {mathFeedback === 'incorrect' && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold flex items-center justify-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span>إجابة غير صحيحة، حاول مجدداً مع تلميذك!</span>
            </div>
          )}

          <button
            onClick={nextMathProblem}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-300 mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>عملية حسابية جديدة</span>
          </button>
        </div>
      )}

      {activeGame === 'truefalse' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>سؤال الثقافة والتعلمات</span>
            <span>{tfIndex + 1} / {tfQuestions.length}</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-base font-bold text-slate-900 dark:text-white leading-relaxed">
            « {tfQuestions[tfIndex].q} »
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => answerTrueFalse(true)}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              ✓ صـحـيـح
            </button>
            <button
              onClick={() => answerTrueFalse(false)}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              ✗ خــاطــئ
            </button>
          </div>

          {tfFeedback === 'correct' && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
              إجابة صحيحة وممتازة! نال التلميذ ⭐ نجمة إضافية.
            </div>
          )}

          {tfFeedback === 'incorrect' && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold">
              إجابة خاطئة! فكروا في التعليل معاً في القسم.
            </div>
          )}

          <button
            onClick={() => {
              setTfIndex((prev) => (prev + 1) % tfQuestions.length);
              setTfFeedback(null);
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            السؤال التالي →
          </button>
        </div>
      )}

      {activeGame === 'sentence' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl mx-auto text-center space-y-6">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            رتّب الكلمات الآتية لتكوين جملة فعلية مفيدة:
          </h4>

          {/* Constructed Sentence Box */}
          <div className="min-h-16 p-4 rounded-xl border-2 border-dashed border-emerald-500/50 bg-emerald-50/20 flex flex-wrap items-center justify-center gap-2">
            {constructedWords.length === 0 ? (
              <span className="text-xs text-slate-400">
                اضغط على الكلمات بالترتيب لتضعها هنا...
              </span>
            ) : (
              constructedWords.map((word, idx) => (
                <span
                  key={idx}
                  onClick={() => {
                    setConstructedWords((prev) => prev.filter((_, i) => i !== idx));
                    setShuffledWords((prev) => [...prev, word]);
                  }}
                  className="cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs"
                >
                  {word}
                </span>
              ))
            )}
          </div>

          {/* Available Words */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {shuffledWords.map((word, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setConstructedWords((prev) => [...prev, word]);
                  setShuffledWords((prev) => prev.filter((_, i) => i !== idx));
                }}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-emerald-500 shadow-xs"
              >
                {word}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                if (constructedWords.join(' ') === sentenceWords.join(' ')) {
                  rewardCurrentStudent(15, 2);
                  showToast('أحسنت! الجملة صحيحة تماماً وبناء سليم');
                } else {
                  showToast('الترتيب غير صحيح بعد، حاول مجدداً', 'error');
                }
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
            >
              تحقق من صحة الجملة
            </button>
            <button
              onClick={() => {
                setConstructedWords([]);
                setShuffledWords([
                  'بِإِخْلَاصٍ', 'يَشْرَحُ', 'فِي', 'المُعَلِّمُ', 'القِسْمِ', 'الدَّرْسَ'
                ]);
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600"
            >
              إعادة ضبط
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
