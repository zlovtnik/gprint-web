// Service validation schemas
import { z } from 'zod';

export const serviceTypeSchema = z.enum(['PRINT', 'SCAN', 'COPY', 'FAX', 'OTHER']);
export const unitTypeSchema = z.enum(['UNIT', 'PAGE', 'HOUR', 'PROJECT', 'MONTHLY']);

export const createServiceSchema = z.object({
  serviceCode: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código deve ter no máximo 20 caracteres'),
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  description: z.string().max(1000).optional(),
  serviceType: serviceTypeSchema,
  unitType: unitTypeSchema,
  unitPrice: z
    .string()
    .min(1, 'Preço é obrigatório')
    .refine((val) => val.trim() !== '' && !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Preço deve ser um número válido e não negativo'
    })
});

export const updateServiceSchema = createServiceSchema.partial().omit({ serviceCode: true }).extend({
  active: z.boolean().optional()
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
