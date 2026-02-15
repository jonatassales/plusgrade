import { z } from 'zod'

export const incomeTaxInputSchema = z.object({
  income: z
    .string()
    .trim()
    .min(1, 'Annual income is required.')
    .max(12, 'Annual income must be 12 digits or fewer.')
    .regex(/^\d+$/, 'Annual income must contain only numbers.'),
  year: z
    .string()
    .trim()
    .length(4, 'Tax year must have 4 digits.')
    .regex(/^\d+$/, 'Tax year must contain only numbers.')
    .refine((value) => {
      const year = Number(value)
      return year >= 2000 && year <= 2100
    }, 'Tax year must be between 2000 and 2100.')
})

export type IncomeTaxInput = z.infer<typeof incomeTaxInputSchema>
