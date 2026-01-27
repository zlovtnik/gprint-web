// Type predicates and guards

export const isString = (value: unknown): value is string => typeof value === 'string';

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !Number.isNaN(value);

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isArray = <T>(value: unknown): value is T[] => Array.isArray(value);

export const isNonEmpty = <T>(arr: T[]): arr is [T, ...T[]] => arr.length > 0;

export const isNullish = (value: unknown): value is null | undefined => value == null;

export const isNotNullish = <T>(value: T | null | undefined): value is T => value != null;

export const hasProperty = <K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> => isObject(obj) && key in obj;

// Domain-specific predicates
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidCPF = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;

  return true;
};

export const isValidCNPJ = (cnpj: string): boolean => {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(digits[12])) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(digits[13])) return false;

  return true;
};

export const isValidTaxId = (taxId: string): boolean => {
  const digits = taxId.replace(/\D/g, '');
  if (digits.length === 11) return isValidCPF(taxId);
  if (digits.length === 14) return isValidCNPJ(taxId);
  return false;
};

export const isValidPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
};
