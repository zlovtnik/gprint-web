// Contract validation schemas
import { z } from 'zod';

export const contractTypeSchema = z.enum(['SERVICE', 'RECURRING', 'PROJECT']);
export const contractStatusSchema = z.enum([
  'DRAFT',
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'CANCELLED',
  'COMPLETED'
]);
export const billingCycleSchema = z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONCE']);

export const createContractSchema = z.object({
  contractNumber: z.string().min(1, 'Número do contrato é obrigatório'),
  customerId: z.number().min(1, 'Cliente é obrigatório'),
  contractType: contractTypeSchema,
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().optional(),
  durationMonths: z.union([
    z.string().transform((val) => val === '' ? undefined : parseInt(val, 10)),
    z.number()
  ]).optional().refine((val) => val === undefined || val >= 1, { message: 'Duração deve ser pelo menos 1 mês' }),
  autoRenew: z.boolean().optional().default(false),
  paymentTerms: z.string().max(500).optional(),
  billingCycle: billingCycleSchema,
  notes: z.string().max(2000).optional()
});

export const updateContractSchema = createContractSchema.partial();

export const addContractItemSchema = z.object({
  serviceId: z.number().min(1, 'Serviço é obrigatório'),
  quantity: z
    .string()
    .min(1, 'Quantidade é obrigatória')
    .refine((val) => /^-?\d+(\.\d+)?$/.test(val.trim()) && parseFloat(val) > 0, {
      message: 'Quantidade deve ser maior que zero'
    })
    .transform((val) => parseFloat(val)),
  unitPrice: z
    .string()
    .min(1, 'Preço unitário é obrigatório')
    .refine((val) => /^-?\d+(\.\d+)?$/.test(val.trim()) && parseFloat(val) >= 0, {
      message: 'Preço deve ser um número válido'
    })
    .transform((val) => parseFloat(val)),
  discountPct: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100),
      { message: 'Desconto deve ser entre 0 e 100' }
    ),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().max(500).optional()
});

export type CreateContractInput = z.input<typeof createContractSchema>;
export type CreateContractOutput = z.output<typeof createContractSchema>;
export type UpdateContractInput = z.input<typeof updateContractSchema>;
export type AddContractItemInput = z.infer<typeof addContractItemSchema>;
