// Customer validation schemas
import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  zip: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido (formato: 12345-678 ou 12345678)').optional(),
  country: z.string().optional()
});

export const customerTypeSchema = z.enum(['INDIVIDUAL', 'COMPANY']);

export const createCustomerSchema = z.object({
  customerCode: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código deve ter no máximo 20 caracteres'),
  customerType: customerTypeSchema,
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  tradeName: z.string().max(200).optional(),
  taxId: z.string().max(20).optional(),
  stateReg: z.string().max(20).optional(),
  municipalReg: z.string().max(20).optional(),
  email: z.union([z.string().email('E-mail inválido'), z.literal('')]).optional(),
  phone: z.string().max(20).optional(),
  mobile: z.string().max(20).optional(),
  address: addressSchema.optional(),
  notes: z.string().max(1000).optional()
});

export const updateCustomerSchema = createCustomerSchema.partial().omit({ customerCode: true }).extend({
  active: z.boolean().optional()
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
