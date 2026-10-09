import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Star,
  Award,
  Phone,
  Calendar,
  User,
  Heart,
  Sparkles,
  ArrowUpDown,
  LayoutGrid,
  List,
  CheckCircle,
} from 'lucide-react';

interface StudentsViewProps {
  onOpenImportModal: () => void;
  onOpenExportModal: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  onOpenImportModal,
  onOpenExportModal,
}) => {
  const {
    activeClass,
    classStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'M' | 'F'>('all');
  const [sortBy, setSortBy] = useState<'reg' | 'name' | 'points'>('reg');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    registrationNumber: '',
    lastName: '',
    firstName: '',
    birthDate: '2016-01-01',
    gender: 'M' as 'M' | 'F',
    parentName: '',
    parentPhone: '',
    notes: '',
    behaviorScore: 5,
  });

  // Filter & Sort
  const filteredStudents = classStudents
    .filter((s) => {
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        s.firstName.toLowerCase().includes(query) ||
        s.lastName.toLowerCase().includes(query) ||
        s.registrationNumber.includes(query) ||
        (s.parentName && s.parentName.toLowerCase().includes(query));

      const matchGender = genderFilter === 'all' || s.gender === genderFilter;
      return matchQuery && matchGender;
    })
    .sort((a, b) => {
      if (sortBy === 'reg') return a.registrationNumber.localeCompare(b.registrationNumber, undefined, { numeric: true });
      if (sortBy === 'name') return a.lastName.localeCompare(b.lastName, 'ar');
      if (sortBy === 'points') return (b.points || 0) - (a.points || 0);
      return 0;
    });

  const handleOpenAdd = () => {
    setFormData({
      registrationNumber: String(classStudents.length + 1).padStart(2, '0'),
      lastName: '',
      firstName: '',
      birthDate: '2016-01-01',
      gender: 'M',
      parentName: '',
      parentPhone: '',
      notes: '',
      behaviorScore: 5,
    });
    setEditingStudent(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setFormData({
      registrationNumber: student.registrationNumber,
      lastName: student.lastName,
      firstName: student.firstName,
      birthDate: student.birthDate,
      gender: student.gender,
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      notes: student.notes || '',
      behaviorScore: student.behaviorScore || 5,
    });
    setEditingStudent(student);
    setShowAddModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lastName.trim() || !formData.firstName.trim()) {
      showToast('يرجى إدخال اسم ولقب التلميذ', 'error');
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
    } else {
      if (!activeClass) return;
      addStudent({
        ...formData,
        classId: activeClass.id,
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>قائمة تلاميذ القسم ({activeClass?.name})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إجمالي {classStudents.length} تلميذ · إدارة الملفات الفردية، استيراد وتصدير القوائم
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>📥 استيراد قائمة (Excel / OCR)</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>📤 تصدير Excel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تلميذ جديد</span>
          </button>
        </div>
      </div>

      {/* Filter & Live Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث فوري بالاسم أو اللقب أو الرقم..."
            className="w-full ps-9 pe-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Gender Filter */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                genderFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setGenderFilter('M')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                genderFilter === 'M'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              ذكور ({classStudents.filter((s) => s.gender === 'M').length})
            </button>
            <button
              onClick={() => setGenderFilter('F')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                genderFilter === 'F'
                  ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              إناث ({classStudents.filter((s) => s.gender === 'F').length})
            </button>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="reg">ترتيب حسب رقم التسجيل</option>
              <option value="name">ترتيب أبجدي (اللقب)</option>
              <option value="points">ترتيب حسب النقاط والتحفيز</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 border-s border-slate-200 dark:border-slate-800 ps-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'table' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'cards' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Students Data Display */}
      {filteredStudents.length === 0 ? (
        <div className="py-16 text-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            لم يتم العثور على أي تلاميذ
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'جرّب تعديل عبارة البحث أو الفلتر.'
              : 'ابدأ بإضافة تلاميذك الآن أو استيراد قائمة كاملة من ملف Excel أو مسح ورقي.'}
          </p>
          <button
            onClick={onOpenImportModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
          >
            استيراد قائمة التلاميذ
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <table className="w-full text-xs text-right border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-3 w-16 text-center">الرقم</th>
                <th className="p-3">اللقب والاسم</th>
                <th className="p-3">تاريخ الميلاد</th>
                <th className="p-3">الجنس</th>
                <th className="p-3">ولي الأمر</th>
                <th className="p-3">هاتف الولي</th>
                <th className="p-3 text-center">النقاط والنجوم</th>
                <th className="p-3 text-center w-28">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredStudents.map((st) => (
                <tr
                  key={st.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3 text-center font-mono font-bold text-slate-500">
                    {st.registrationNumber}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setViewingStudent(st)}
                      className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 text-right flex items-center gap-2"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          st.gender === 'F'
                            ? 'bg-pink-100 text-pink-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {st.firstName.charAt(0)}
                      </div>
                      <span>
                        {st.lastName} {st.firstName}
                      </span>
                    </button>
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                    {st.birthDate}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        st.gender === 'F'
                          ? 'bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-300'
                          : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {st.gender === 'M' ? 'ذكر' : 'أنثى'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    {st.parentName || '—'}
                  </td>
                  <td className="p-3 font-mono text-slate-500">
                    {st.parentPhone ? (
                      <a
                        href={`tel:${st.parentPhone}`}
                        className="hover:text-emerald-600 hover:underline"
                      >
                        {st.parentPhone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold text-emerald-600">{st.points || 0} ن</span>
                      <span className="flex items-center text-amber-500 font-bold">
                        ⭐ {st.stars || 0}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setViewingStudent(st)}
                        className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="عرض الملف الكامل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(st)}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="تعديل بيانات التلميذ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingStudentId(st.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="حذف التلميذ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((st) => (
            <div
              key={st.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs ${
                      st.gender === 'F'
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {st.firstName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {st.lastName} {st.firstName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      رقم التسجيل: #{st.registrationNumber}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    st.gender === 'F'
                      ? 'bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-300'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}
                >
                  {st.gender === 'M' ? 'ذكر' : 'أنثى'}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/60 pt-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>الميلاد:</span>
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{st.birthDate}</span>
                </div>
                {st.parentPhone && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>الولي:</span>
                    </span>
                    <span className="font-mono text-emerald-600">{st.parentPhone}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600">{st.points || 0} ن</span>
                  <span className="text-amber-500 font-bold">⭐ {st.stars || 0}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingStudent(st)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(st)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingStudentId(st.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveStudent}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingStudent ? 'تعديل بيانات التلميذ' : 'إضافة تلميذ جديد إلى القسم'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  رقم التسجيل:
                </label>
                <input
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  الجنس:
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="M">ذكر</option>
                  <option value="F">أنثى</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  اللقب (إلزامي):
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="مثال: بن علي"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  الاسم (إلزامي):
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="مثال: محمد"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  تاريخ الميلاد:
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  اسم ولي الأمر:
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="مثال: علي بن علي"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  رقم هاتف الولي:
                </label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="مثال: 0661234567"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  ملاحظات المعلم:
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات تربوية أو صحية خاصة..."
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
                {editingStudent ? 'حفظ التعديلات' : 'إضافة التلميذ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Student Profile Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs ${
                    viewingStudent.gender === 'F'
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {viewingStudent.firstName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {viewingStudent.lastName} {viewingStudent.firstName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    رقم التسجيل: #{viewingStudent.registrationNumber} · {activeClass?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Profile fields */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">تاريخ الميلاد:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {viewingStudent.birthDate}
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">الجنس:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {viewingStudent.gender === 'M' ? 'ذكر' : 'أنثى'}
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">ولي الأمر:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {viewingStudent.parentName || 'غير مسجل'}
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">رقم الهاتف:</span>
                <span className="font-mono font-bold text-emerald-600">
                  {viewingStudent.parentPhone || 'غير مسجل'}
                </span>
              </div>

              {/* Badges & Stars */}
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <span className="text-amber-800 dark:text-amber-300 font-bold block mb-1">
                  التحفيز والتميز الصفّي:
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-amber-600">
                    ⭐ {viewingStudent.stars || 0} نجمة
                  </span>
                  <span className="font-extrabold text-emerald-600">
                    {viewingStudent.points || 0} نقطة
                  </span>
                </div>
                {viewingStudent.badges && viewingStudent.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {viewingStudent.badges.map((b, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px] font-bold"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {viewingStudent.notes && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block mb-0.5">ملاحظات المعلم:</span>
                  <p className="text-slate-700 dark:text-slate-300">{viewingStudent.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setViewingStudent(null);
                  handleOpenEdit(viewingStudent);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50"
              >
                تعديل الملف
              </button>
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                حذف التلميذ من القسم
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                هل أنت متأكد من حذف هذا التلميذ؟ ستتم إزالة سجله من قوائم الحضور والتقويمات.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingStudentId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  deleteStudent(deletingStudentId);
                  setDeletingStudentId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
