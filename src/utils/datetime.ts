import { Language } from '../types';

// Hijri Month names
export const HIJRI_MONTHS_AR = [
  'المحرّم',
  'صفر',
  'ربيع الأول',
  'ربيع الثاني',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوّال',
  'ذو القعدة',
  'ذو الحجة',
];

export const HIJRI_MONTHS_FR = [
  'Mouharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi ath-Thani',
  'Joumada al-Oula',
  'Joumada ath-Thaniya',
  'Rajab',
  'Chaabane',
  'Ramadan',
  'Chawwal',
  'Dhou al-Qi`da',
  'Dhou al-Hijja',
];

export const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Sha\'ban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qi\'dah',
  'Dhu al-Hijjah',
];

/**
 * Computes Hijri date using astronomical/algorithmic kuwaiti/civil calendar
 * adjusted with the customizable hijriOffset (+2, +1, 0, -1, -2).
 */
export function getHijriDate(date: Date, offsetDays: number = 0) {
  // Apply day offset
  const targetDate = new Date(date.getTime() + offsetDays * 86400000);

  // Kuwati algorithmic calculation adjusted
  let day = targetDate.getDate();
  let month = targetDate.getMonth();
  let year = targetDate.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

  let b2 = 0;
  if (jd > 2299160) {
    let a2 = Math.floor((jd - 1867216.25) / 36524.25);
    b2 = 1 + a2 - Math.floor(a2 / 4);
  }
  let bb = jd + b2 + 1524;
  let cc = Math.floor((bb - 122.1) / 365.25);
  let dd = Math.floor(365.25 * cc);
  let ee = Math.floor((bb - dd) / 30.6001);

  let z = jd - 1948440 + 10632;
  let n = Math.floor((z - 1) / 10631);
  z = z - 10631 * n + 354;
  let j =
    Math.floor((10985 - z) / 5316) * Math.floor((50 * z) / 17719) +
    Math.floor(z / 5670) * Math.floor((43 * z) / 15238);
  z =
    z -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  let hijriMonth = Math.floor((24 * z) / 709);
  let hijriDay = z - Math.floor((709 * hijriMonth) / 24);
  let hijriYear = 30 * n + j - 30;

  // Safeguards
  hijriMonth = Math.max(0, Math.min(11, hijriMonth - 1));
  hijriDay = Math.max(1, Math.min(30, hijriDay));

  return {
    day: hijriDay,
    monthIndex: hijriMonth,
    year: hijriYear,
  };
}

/**
 * Returns complete formatted live Algerian date & time
 */
export function getFormattedAlgeriaDateTime(
  date: Date = new Date(),
  lang: Language = 'ar',
  timeFormat: '24h' | '12h' = '24h',
  hijriOffset: number = 0
) {
  // Algerian Timezone: Africa/Algiers (UTC+1)
  const algeriaOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Africa/Algiers',
    hour12: timeFormat === '12h',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  const timeString = new Intl.DateTimeFormat(
    lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-US',
    algeriaOptions
  ).format(date);

  // Day of Week
  const dayName = new Intl.DateTimeFormat(
    lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-US',
    { timeZone: 'Africa/Algiers', weekday: 'long' }
  ).format(date);

  // Gregorian Date
  const gregorianDate = new Intl.DateTimeFormat(
    lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-US',
    { timeZone: 'Africa/Algiers', day: 'numeric', month: 'long', year: 'numeric' }
  ).format(date);

  // Hijri Calculation
  const hijri = getHijriDate(date, hijriOffset);
  let hijriMonthName = HIJRI_MONTHS_AR[hijri.monthIndex];
  let hijriSuffix = 'هـ';

  if (lang === 'fr') {
    hijriMonthName = HIJRI_MONTHS_FR[hijri.monthIndex];
    hijriSuffix = 'H';
  } else if (lang === 'en') {
    hijriMonthName = HIJRI_MONTHS_EN[hijri.monthIndex];
    hijriSuffix = 'AH';
  }

  const hijriDate = `${hijri.day} ${hijriMonthName} ${hijri.year} ${hijriSuffix}`;

  return {
    time: timeString,
    dayName,
    gregorianDate,
    hijriDate,
    hijri,
    currentYear: date.getFullYear(),
  };
}
