import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarEvent } from '../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  BookOpen,
  FileText,
  Users,
} from 'lucide-react';

export const PlanningView: React.FC = () => {
  const { events, addEvent, deleteEvent, activeClass, showToast } = useApp();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState<string>('09:00');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('lesson');
  const [eventDesc, setEventDesc] = useState<string>('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      showToast('يرجى إدخال عنوان الموعد', 'error');
      return;
    }
    addEvent({
      title: eventTitle.trim(),
      date: eventDate,
      time: eventTime,
      type: eventType,
      classId: activeClass?.id,
      description: eventDesc.trim(),
    });
    setShowAddModal(false);
    setEventTitle('');
  };

  const typeLabels = {
    lesson: { label: 'حصة دراسية', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    exam: { label: 'تقويم / اختبار', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    activity: { label: 'نشاط صفي', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    homework: { label: 'واجب منزلي', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    meeting: { label: 'اجتماع تربوي', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    task: { label: 'مهمة إدارية', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            <span>التخطيط والتقويم البيداغوجي الأسبوعي والشهري</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            برمجة الدروس والاختبارات والأنشطة والواجبات المدرسية
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موعد جديد</span>
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((ev) => {
          const typeInfo = typeLabels[ev.type] || typeLabels.lesson;

          return (
            <div
              key={ev.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeInfo.color}`}
                  >
                    {typeInfo.label}
                  </span>
                  <button
                    onClick={() => deleteEvent(ev.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                  {ev.title}
                </h4>
                {ev.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {ev.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{ev.date}</span>
                <span>{ev.time || '—'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                إضافة موعد أو نشاط جديد
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  عنوان الموعد / النشاط:
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="مثال: تقويم تشخيصي في الرياضيات"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  النوع:
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="lesson">حصة دراسية</option>
                  <option value="exam">تقويم / اختبار</option>
                  <option value="activity">نشاط صفي</option>
                  <option value="homework">واجب منزلي</option>
                  <option value="meeting">اجتماع تربوي</option>
                  <option value="task">مهمة إدارية</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                    التاريخ:
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                    التوقيت:
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  وصف مختصر أو متطلبات:
                </label>
                <textarea
                  rows={2}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="ملاحظات وتوجيهات..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                إضافة الموعد
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
