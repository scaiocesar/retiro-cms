const INVISIBLE_CHARS = /[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g;

function sanitizePhoneInput(value: string): string {
  return value.normalize("NFKC").replace(INVISIBLE_CHARS, "").trim();
}

function extractPhoneDigits(value: string): string {
  let digits = sanitizePhoneInput(value).replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

export function formatPhone(value: string): string {
  const digits = extractPhoneDigits(value);

  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)})${digits.slice(3)}`;
  return `(${digits.slice(0, 3)})${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function phoneDigits(value: string): string {
  return extractPhoneDigits(value);
}

export function isValidPhone(value: string): boolean {
  return phoneDigits(value).length === 10;
}

export function whatsappUrl(telefone: string): string | null {
  const digits = phoneDigits(telefone);
  if (digits.length !== 10) return null;
  return `https://wa.me/1${digits}`;
}

export const PHONE_MASK_PLACEHOLDER = "(123)456-7890";
