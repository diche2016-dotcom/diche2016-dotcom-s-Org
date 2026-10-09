import * as XLSX from 'xlsx';
import { Student, Subject, Assessment, StudentGrade, AttendanceRecord, Language } from '../types';

/**
 * Downloads official Excel template for student roster
 */
export function downloadStudentTemplate(lang: Language = 'ar') {
  let headers: string[];
  let sampleRow: any[];
  let fileName: string;

  if (lang === 'fr') {
    headers = [
      'N° Inscription',
      'Nom',
      'Prénom',
      'Date de naissance',
      'Genre (M/F)',
      'Nom du tuteur',
      'Téléphone du tuteur',
      'Observations',
    ];
    sampleRow = [
      '01',
      'Benali',
      'Mohamed',
      '2016-05-14',
      'M',
      'Ali Benali',
      '0661234567',
      'Exemple à supprimer lors du remplissage',
    ];
    fileName = 'modele_liste_eleves_qasami.xlsx';
  } else if (lang === 'en') {
    headers = [
      'Registration Number',
      'Last Name',
      'First Name',
      'Birth Date',
      'Gender (M/F)',
      'Parent Name',
      'Parent Phone',
      'Notes',
    ];
    sampleRow = [
      '01',
      'Benali',
      'Mohamed',
      '2016-05-14',
      'M',
      'Ali Benali',
      '0661234567',
      'Example row to delete',
    ];
    fileName = 'student_roster_template_qasami.xlsx';
  } else {
    // Arabic (Default)
    headers = [
      'رقم التسجيل',
      'اللقب',
      'الاسم',
      'تاريخ الميلاد',
      'الجنس',
      'اسم ولي الأمر',
      'رقم هاتف ولي الأمر',
      'ملاحظات',
    ];
    sampleRow = [
      '01',
      'بن علي',
      'محمد',
      '2016-05-14',
      'ذكر',
      'علي بن علي',
      '0661234567',
      'صف توضيحي — يمكنك حذفه أو تعديله',
    ];
    fileName = 'نموذج_قائمة_التلاميذ_قسمي.xlsx';
  }

  const wsData = [headers, sampleRow];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 10 },
    { wch: 22 },
    { wch: 18 },
    { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'قائمة التلاميذ');
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports current students list to Excel
 */
export function exportStudentsListToExcel(students: Student[], className: string, lang: Language = 'ar') {
  const isAr = lang === 'ar';
  const isFr = lang === 'fr';

  const headers = isAr
    ? ['رقم التسجيل', 'اللقب', 'الاسم', 'تاريخ الميلاد', 'الجنس', 'ولي الأمر', 'رقم الهاتف', 'النقاط', 'النجوم', 'ملاحظات']
    : isFr
    ? ['N° Inscription', 'Nom', 'Prénom', 'Date de naissance', 'Genre', 'Tuteur', 'Téléphone', 'Points', 'Étoiles', 'Observations']
    : ['Reg Number', 'Last Name', 'First Name', 'Birth Date', 'Gender', 'Parent', 'Phone', 'Points', 'Stars', 'Notes'];

  const rows = students.map((s) => [
    s.registrationNumber,
    s.lastName,
    s.firstName,
    s.birthDate,
    s.gender === 'M' ? (isAr ? 'ذكر' : 'Garçon') : (isAr ? 'أنثى' : 'Fille'),
    s.parentName || '',
    s.parentPhone || '',
    s.points || 0,
    s.stars || 0,
    s.notes || '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 10 },
    { wch: 20 },
    { wch: 16 },
    { wch: 8 },
    { wch: 8 },
    { wch: 24 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'التلاميذ');
  XLSX.writeFile(wb, `قائمة_تلاميذ_${className.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Exports Grade Matrix to Excel
 */
export function exportGradesMatrixToExcel(
  students: Student[],
  subjects: Subject[],
  assessments: Assessment[],
  grades: StudentGrade[],
  className: string
) {
  const headers = ['رقم', 'اللقب', 'الاسم'];
  subjects.forEach((subj) => headers.push(subj.name));
  headers.push('المعدل التقديري / 10');

  const rows = students.map((student) => {
    const studentGrades = grades.filter((g) => g.studentId === student.id);
    let totalScore = 0;
    let scoredCount = 0;

    const subjectScores = subjects.map((subj) => {
      const subjAssessments = assessments.filter((a) => a.subjectId === subj.id);
      const assessmentIds = subjAssessments.map((a) => a.id);
      const gradesForSubj = studentGrades.filter((g) => assessmentIds.includes(g.assessmentId));
      if (gradesForSubj.length > 0) {
        const avg = gradesForSubj.reduce((sum, g) => sum + g.score, 0) / gradesForSubj.length;
        totalScore += avg;
        scoredCount += 1;
        return Number(avg.toFixed(2));
      }
      return '-';
    });

    const studentAvg = scoredCount > 0 ? (totalScore / scoredCount).toFixed(2) : '-';

    return [student.registrationNumber, student.lastName, student.firstName, ...subjectScores, studentAvg];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'كشف النتائج');
  XLSX.writeFile(wb, `كشف_نتائج_${className.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Exports Attendance Log to Excel
 */
export function exportAttendanceLogToExcel(
  students: Student[],
  attendance: AttendanceRecord[],
  className: string,
  filterName: string = 'الشهر الحالي'
) {
  const headers = ['رقم التسجيل', 'اللقب', 'الاسم', 'أيام الغياب', 'مرات التأخر', 'نسبة الحضور التقديرية %'];

  const rows = students.map((student) => {
    const studentRecords = attendance.filter((a) => a.studentId === student.id);
    const absentCount = studentRecords.filter((a) => a.status === 'absent').length;
    const lateCount = studentRecords.filter((a) => a.status === 'late').length;
    const totalDays = Math.max(1, studentRecords.length);
    const presentCount = studentRecords.filter((a) => a.status === 'present').length;
    const rate = Math.round((presentCount / totalDays) * 100);

    return [student.registrationNumber, student.lastName, student.firstName, absentCount, lateCount, `${rate}%`];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'سجل الحضور');
  XLSX.writeFile(wb, `سجل_حضور_${className.replace(/\s+/g, '_')}_${filterName}.xlsx`);
}

/**
 * Full Class Backup Export
 */
export function exportClassBackupToExcel(classData: any, className: string) {
  const wb = XLSX.utils.book_new();

  // 1. Students sheet
  if (classData.students && classData.students.length > 0) {
    const wsStudents = XLSX.utils.json_to_sheet(classData.students);
    XLSX.utils.book_append_sheet(wb, wsStudents, 'التلاميذ');
  }

  // 2. Attendance sheet
  if (classData.attendance && classData.attendance.length > 0) {
    const wsAttendance = XLSX.utils.json_to_sheet(classData.attendance);
    XLSX.utils.book_append_sheet(wb, wsAttendance, 'الحضور');
  }

  // 3. Grades sheet
  if (classData.grades && classData.grades.length > 0) {
    const wsGrades = XLSX.utils.json_to_sheet(classData.grades);
    XLSX.utils.book_append_sheet(wb, wsGrades, 'التقييمات');
  }

  XLSX.writeFile(wb, `نسخة_احتياطية_${className.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Intelligent Column Matcher
 */
export function guessFieldMapping(header: string): string {
  const clean = header.trim().toLowerCase();

  if (/رقم|تسجيل|matricule|reg|id|num/i.test(clean)) return 'registrationNumber';
  if (/لقب|nom|surname|family/i.test(clean)) return 'lastName';
  if (/اسم|prénom|prenom|first/i.test(clean) && !/ولي|tuteur|father/i.test(clean)) return 'firstName';
  if (/ميلاد|تاريخ|naissance|birth|date/i.test(clean)) return 'birthDate';
  if (/جنس|sexe|gender/i.test(clean)) return 'gender';
  if (/ولي|tuteur|father|parent/i.test(clean) && !/هاتف|phone|tel/i.test(clean)) return 'parentName';
  if (/هاتف|téléphone|telephone|phone|tel|mobile/i.test(clean)) return 'parentPhone';
  if (/ملاحظ|obs|remarque|note/i.test(clean)) return 'notes';

  return '';
}

/**
 * Parses uploaded Excel or CSV file in browser
 */
export async function parseExcelOrCsvFile(file: File): Promise<{
  headers: string[];
  rows: any[];
  mappedRows: Partial<Student>[];
  errors: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rawJson || rawJson.length === 0) {
          return resolve({ headers: [], rows: [], mappedRows: [], errors: ['الملف فارغ ولا يحتوي على بيانات'] });
        }

        // Find header row (first non-empty row)
        let headerRowIndex = 0;
        while (headerRowIndex < rawJson.length && (!rawJson[headerRowIndex] || rawJson[headerRowIndex].length === 0)) {
          headerRowIndex++;
        }

        if (headerRowIndex >= rawJson.length) {
          return resolve({ headers: [], rows: [], mappedRows: [], errors: ['تعذر العثور على عناوين الأعمدة في الملف'] });
        }

        const headers = (rawJson[headerRowIndex] as any[]).map((h) => String(h || '').trim());
        const dataRows = rawJson.slice(headerRowIndex + 1).filter((r) => r && r.length > 0 && r.some((c) => !!c));

        // Map column indices
        const mapping: Record<string, number> = {};
        headers.forEach((h, idx) => {
          const guessedField = guessFieldMapping(h);
          if (guessedField && !mapping[guessedField]) {
            mapping[guessedField] = idx;
          }
        });

        const errors: string[] = [];
        const mappedRows: Partial<Student>[] = [];

        dataRows.forEach((row, rowIdx) => {
          // If this row is just an example/instruction row, skip it
          const rowText = row.join(' ');
          if (/صف توضيحي|exemple|example/i.test(rowText)) {
            return;
          }

          const studentObj: Partial<Student> = {
            registrationNumber: mapping.registrationNumber !== undefined ? String(row[mapping.registrationNumber] || '').trim() : String(rowIdx + 1),
            lastName: mapping.lastName !== undefined ? String(row[mapping.lastName] || '').trim() : '',
            firstName: mapping.firstName !== undefined ? String(row[mapping.firstName] || '').trim() : '',
            birthDate: mapping.birthDate !== undefined ? String(row[mapping.birthDate] || '').trim() : '',
            gender: 'M',
            parentName: mapping.parentName !== undefined ? String(row[mapping.parentName] || '').trim() : '',
            parentPhone: mapping.parentPhone !== undefined ? String(row[mapping.parentPhone] || '').trim() : '',
            notes: mapping.notes !== undefined ? String(row[mapping.notes] || '').trim() : '',
          };

          // Gender detection
          if (mapping.gender !== undefined) {
            const rawG = String(row[mapping.gender] || '').toLowerCase();
            if (/أنثى|بنت|f|femme|female/i.test(rawG)) {
              studentObj.gender = 'F';
            } else {
              studentObj.gender = 'M';
            }
          }

          // Validation
          if (!studentObj.lastName && !studentObj.firstName) {
            errors.push(`الصف ${rowIdx + 1}: الاسم واللقب غير موجودين`);
          }

          mappedRows.push(studentObj);
        });

        resolve({
          headers,
          rows: dataRows,
          mappedRows,
          errors,
        });
      } catch (err: any) {
        reject(new Error(`تعذر قراءة ملف Excel: ${err.message || 'صيغة غير متوافقة'}`));
      }
    };

    reader.onerror = () => reject(new Error('فشل في قراءة الملف من الجهاز'));
    reader.readAsArrayBuffer(file);
  });
}
