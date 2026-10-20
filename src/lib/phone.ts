/**
 * Оставляет в номере только цифры: «+7 (900) 123-45-67» → «79001234567».
 * Возвращает null, если номер не похож на международный (10–15 цифр по E.164).
 */
export function normalizePhone(phone: string): string | null {
  let digits = phone.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  }

  if (digits.length < 10 || digits.length > 15) return null;

  return digits;
}

export function formatPhone(digits: string): string {
  return `+${digits}`;
}
