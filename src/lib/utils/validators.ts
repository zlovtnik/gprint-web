// Validation utilities
import { z } from 'zod';
import { Ok, Err, type Result } from './result';

export interface ValidationError {
  field: string;
  message: string;
}

// Convert Zod errors to our ValidationError format
export const zodToValidationErrors = (error: z.ZodError): ValidationError[] =>
  error.issues.map((e) => ({
    field: e.path.join('.'),
    message: e.message
  }));

// Validate with a Zod schema and return Result
export const validateWith =
  <T>(schema: z.ZodSchema<T>) =>
  (data: unknown): Result<T, ValidationError[]> => {
    const result = schema.safeParse(data);
    if (result.success) {
      return Ok(result.data);
    }
    return Err(zodToValidationErrors(result.error));
  };

// Common validation patterns
export const required = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== '';

export const minLength =
  (min: number) =>
  (value: string): boolean =>
    value != null && value.length >= min;

export const maxLength =
  (max: number) =>
  (value: string): boolean =>
    value != null && value.length <= max;

export const between =
  (min: number, max: number) =>
  (value: number): boolean =>
    value >= min && value <= max;

export const matches =
  (pattern: RegExp) =>
  (value: string): boolean =>
    pattern.test(value);

// Form validation helper
export type FieldValidator<T> = (value: T) => string | null;

export const composeValidators =
  <T>(...validators: FieldValidator<T>[]): FieldValidator<T> =>
  (value: T) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };

export const createRequiredValidator =
  (message: string = 'Este campo é obrigatório'): FieldValidator<string> =>
  (value) =>
    required(value) ? null : message;

export const createMinLengthValidator =
  (min: number, message?: string): FieldValidator<string> =>
  (value) =>
    minLength(min)(value) ? null : message ?? `Mínimo de ${min} caracteres`;

export const createMaxLengthValidator =
  (max: number, message?: string): FieldValidator<string> =>
  (value) =>
    maxLength(max)(value) ? null : message ?? `Máximo de ${max} caracteres`;

export const createEmailValidator =
  (message: string = 'E-mail inválido'): FieldValidator<string> =>
  (value) =>
    !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : message;
