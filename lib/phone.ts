const NIGERIAN_LOCAL_PHONE_REGEX = /^0[789][01]\d{8}$/;

function stripPhoneFormatting(value: string) {
  return value.replace(/\D/g, '');
}

export interface NigerianPhoneParseResult {
  isValid: boolean;
  normalized: string;
  error?: string;
}

export function parseNigerianPhone(input: string): NigerianPhoneParseResult {
  const digits = stripPhoneFormatting(input.trim());

  if (!digits) {
    return {
      isValid: false,
      normalized: '',
      error: 'Phone number is required',
    };
  }

  let normalized = digits;

  if (normalized.startsWith('234') && normalized.length === 13) {
    normalized = `0${normalized.slice(3)}`;
  } else if (normalized.startsWith('234') && normalized.length === 14 && normalized[3] === '0') {
    normalized = `0${normalized.slice(4)}`;
  } else if (normalized.length === 10 && /^[789][01]\d{8}$/.test(normalized)) {
    normalized = `0${normalized}`;
  }

  if (!NIGERIAN_LOCAL_PHONE_REGEX.test(normalized)) {
    return {
      isValid: false,
      normalized,
      error: 'Enter a valid 11 digit Nigerian phone number',
    };
  }

  return {
    isValid: true,
    normalized,
  };
}

export function formatNigerianPhone(input: string) {
  const digits = stripPhoneFormatting(input).slice(0, 11);

  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;

  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}