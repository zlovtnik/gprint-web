import { format, parseISO, isValid } from 'date-fns';
import Decimal from 'decimal.js-light';

// Currency formatting
export const toDecimal = (value: string | number): Decimal => new Decimal(value);

export const formatCurrency =
  (currency: string = 'BRL') =>
  (value: Decimal | string | number): string => {
    const decimal = value instanceof Decimal ? value : new Decimal(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency
    }).format(decimal.toNumber());
  };

export const formatNumber =
  (decimals: number = 2) =>
  (value: Decimal | string | number): string => {
    const decimal = value instanceof Decimal ? value : new Decimal(value);
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(decimal.toNumber());
  };

export const formatPercent = (value: Decimal | string | number): string => {
  const decimal = value instanceof Decimal ? value : new Decimal(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(decimal.dividedBy(100).toNumber());
};

// Date formatting
export const parseDate = (dateString: string): Date | null => {
  const date = parseISO(dateString);
  return isValid(date) ? date : null;
};

export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '—';

  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  if (!isValid(date)) return '—';

  return format(date, 'dd/MM/yyyy');
};

export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '—';

  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  if (!isValid(date)) return '—';

  return format(date, 'dd/MM/yyyy HH:mm');
};

export const formatDateISO = (date: Date): string => format(date, 'yyyy-MM-dd');

// String formatting
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const truncate =
  (maxLength: number, suffix: string = '...') =>
  (str: string): string => {
    if (str.length <= maxLength) return str;
    if (maxLength <= suffix.length) {
      return str.slice(0, Math.max(0, maxLength));
    }
    return str.slice(0, maxLength - suffix.length) + suffix;
  };

// Phone formatting (Brazilian)
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '—';

  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phone;
};

// Tax ID formatting (CPF/CNPJ)
export const formatTaxId = (taxId: string | null | undefined): string => {
  if (!taxId) return '—';

  const digits = taxId.replace(/\D/g, '');

  if (digits.length === 11) {
    // CPF: 000.000.000-00
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  if (digits.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }

  return taxId;
};
