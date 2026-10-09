import { ActivationCode, LicenseInfo, LicenseType, SubscriptionStatus } from '../types';

export const TRIAL_DAYS_DEFAULT = 10;

// Storage key for generated codes
export const CODES_STORAGE_KEY = 'qasami_activation_codes';

// Master bypass codes for administrator and developer testing
export const MASTER_CODES: Record<string, { type: LicenseType; label: string }> = {
  'QASAMI-2026-VIP': { type: 'lifetime', label: 'ترخيص كامل دائم مدى الحياة (Master VIP)' },
  'DICHE-2026-PRO': { type: 'lifetime', label: 'ترخيص المطور الأستاذ ديش صلاح الدين' },
  'ALGERIA-PRI-EDU': { type: 'annual', label: 'ترخيص بيداغوجي للموسم الدراسي 2025/2026' },
  'QSM-TRIAL-30D': { type: 'extended_30d', label: 'تمديد تجريبي إضافي 30 يوماً' },
};

/**
 * Calculates trial days remaining from start date
 */
export function calculateTrialDaysRemaining(startDateStr?: string, totalDays = TRIAL_DAYS_DEFAULT): number {
  if (!startDateStr) return totalDays;
  try {
    const start = new Date(startDateStr).getTime();
    const now = new Date().getTime();
    const diffMs = now - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const remaining = totalDays - diffDays;
    return Math.max(0, remaining);
  } catch {
    return totalDays;
  }
}

/**
 * Computes a checksum character for a given string
 */
function computeChecksum(input: string): string {
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum += input.charCodeAt(i) * (i + 1);
  }
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  return chars.charAt(sum % chars.length);
}

/**
 * Generates a high-security structured activation code
 * Format: QSM-[TYPE]-[PART1]-[PART2]-[CHECKSUM]
 * Example: QSM-LFT-8492-MK72-X
 */
export function generateActivationCode(
  type: LicenseType = 'annual',
  recipientName?: string,
  notes?: string
): ActivationCode {
  const typePrefix = type === 'lifetime' ? 'LFT' : type === 'extended_30d' ? 'EXT' : 'ANN';
  
  // Random characters (avoiding easily confused ones like 0, O, 1, I)
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += charset.charAt(Math.floor(Math.random() * charset.length));
    part2 += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  const raw = `${typePrefix}${part1}${part2}`;
  const checksum = computeChecksum(raw);
  const codeString = `QSM-${typePrefix}-${part1}-${part2}-${checksum}`;

  const newCode: ActivationCode = {
    id: `code-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    code: codeString,
    type,
    createdAt: new Date().toISOString(),
    generatedFor: recipientName?.trim() || undefined,
    isUsed: false,
    notes,
  };

  // Save to stored list
  saveCodeToStorage(newCode);

  return newCode;
}

/**
 * Saves a code into localStorage
 */
export function saveCodeToStorage(code: ActivationCode) {
  try {
    const list = getStoredActivationCodes();
    // Prepend new code
    const updated = [code, ...list.filter((c) => c.code !== code.code)];
    localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save code to storage', e);
  }
}

/**
 * Retrieves all stored activation codes
 */
export function getStoredActivationCodes(): ActivationCode[] {
  try {
    const raw = localStorage.getItem(CODES_STORAGE_KEY);
    if (!raw) {
      // Seed initial sample codes for the developer
      const seedCodes: ActivationCode[] = [
        {
          id: 'code-seed-1',
          code: 'QSM-ANN-7842-WK91-M',
          type: 'annual',
          createdAt: new Date().toISOString(),
          generatedFor: 'الأستاذ: أحمد محمد (مدرسة النجاح)',
          isUsed: false,
          notes: 'كود ترخيص سنوي للموسم الدراسي 2025/2026',
        },
        {
          id: 'code-seed-2',
          code: 'QSM-LFT-9912-PX34-K',
          type: 'lifetime',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          generatedFor: 'الأستاذ: بلخير مصطفى',
          isUsed: false,
          notes: 'ترخيص كامل مدى الحياة',
        },
        {
          id: 'code-seed-3',
          code: 'QSM-EXT-4510-RT88-C',
          type: 'extended_30d',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          generatedFor: 'أستاذة التربية الإسلامية - ولاية سطيف',
          isUsed: false,
          notes: 'تمديد تجريبي إضافي 30 يوماً',
        },
      ];
      localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(seedCodes));
      return seedCodes;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Marks a code as used in storage
 */
export function markCodeAsUsed(codeStr: string, userName?: string): boolean {
  try {
    const list = getStoredActivationCodes();
    let found = false;
    const updated = list.map((c) => {
      if (c.code.toUpperCase() === codeStr.toUpperCase().trim()) {
        found = true;
        return {
          ...c,
          isUsed: true,
          usedBy: userName || 'أستاذ',
          usedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(updated));
    return found;
  } catch {
    return false;
  }
}

/**
 * Validates an activation code entered by the user
 */
export function verifyActivationCode(enteredCode: string): {
  valid: boolean;
  type: LicenseType;
  label: string;
  message: string;
} {
  const clean = enteredCode.trim().toUpperCase();

  // 1. Check Master Codes
  if (MASTER_CODES[clean]) {
    const item = MASTER_CODES[clean];
    return {
      valid: true,
      type: item.type,
      label: item.label,
      message: `تم التفعيل بنجاح عبر الكود الرئيسي: ${item.label}`,
    };
  }

  // 2. Check Stored Codes
  const storedList = getStoredActivationCodes();
  const matchedStored = storedList.find((c) => c.code.toUpperCase() === clean);
  if (matchedStored) {
    if (matchedStored.isUsed) {
      return {
        valid: false,
        type: matchedStored.type,
        label: '',
        message: 'عذراً، هذا الكود تم استخدامه مسبقاً. يرجى التواصل مع الأستاذ ديش صلاح الدين للحصول على كود جديد.',
      };
    }
    const typeLabel =
      matchedStored.type === 'lifetime'
        ? 'ترخيص دائم مدى الحياة'
        : matchedStored.type === 'annual'
        ? 'ترخيص سنوي للموسم الدراسي 2025/2026'
        : 'تمديد تجريبي 30 يوماً';
    return {
      valid: true,
      type: matchedStored.type,
      label: typeLabel,
      message: `تم التحقق بنجاح! تم تفعيل حسابك كـ: ${typeLabel}`,
    };
  }

  // 3. Algorithmic Checksum Validation for formatted codes (e.g. QSM-ANN-XXXX-YYYY-Z)
  const parts = clean.split('-');
  if (parts.length === 5 && parts[0] === 'QSM') {
    const [_, typePrefix, part1, part2, check] = parts;
    const raw = `${typePrefix}${part1}${part2}`;
    const expectedCheck = computeChecksum(raw);

    if (check === expectedCheck) {
      let resolvedType: LicenseType = 'annual';
      let typeLabel = 'ترخيص سنوي للموسم الدراسي 2025/2026';
      if (typePrefix === 'LFT') {
        resolvedType = 'lifetime';
        typeLabel = 'ترخيص دائم مدى الحياة';
      } else if (typePrefix === 'EXT') {
        resolvedType = 'extended_30d';
        typeLabel = 'تمديد تجريبي 30 يوماً';
      }

      return {
        valid: true,
        type: resolvedType,
        label: typeLabel,
        message: `تم التحقق من صحة الكود الرياضي بنجاح (${typeLabel})!`,
      };
    }
  }

  return {
    valid: false,
    type: 'trial_10d',
    label: '',
    message: 'كود التفعيل غير صالح. يرجى التأكد من كتابة الرموز بشكل صحيح أو التواصل مع مطور المنصة.',
  };
}

/**
 * Builds a ready WhatsApp share text with code and instructions
 */
export function buildWhatsAppShareText(code: ActivationCode): string {
  const typeText =
    code.type === 'lifetime'
      ? 'ترخيص دائم مدى الحياة'
      : code.type === 'annual'
      ? 'ترخيص سنوي للموسم الدراسي 2025/2026'
      : 'تمديد تجريبي 30 يوماً';

  return `السلام عليكم ورحمة الله وبركاته،
إليك كود تفعيل منصة «قسمي» لمساعد معلم التعليم الابتدائي:

🔑 كود التفعيل: ${code.code}
📌 نوع الترخيص: ${typeText}
${code.generatedFor ? `👤 مخصص للأستاذ(ة): ${code.generatedFor}\n` : ''}
طريقة التفعيل:
1. افتح منصة «قسمي»
2. انقر على «تفعيل الحساب بالكود» في الشريط العلوي
3. الصق كود التفعيل أعلاه واضغط على «تأكيد التفعيل»

مع تحيات الأستاذ: ديش صلاح الدين
مطور منصة قسمي`;
}
