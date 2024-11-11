import { z } from 'zod'
import { type Genetic, type Plant, type Batch } from '~/server/db/schemas'

export const geneticFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['sativa', 'indica', 'hybrid']),
  breeder: z.string().nullish(),
  description: z.string().nullish(),
  floweringTime: z.number().nullish(),
  thcPotential: z.preprocess(
    (val) => (val === '' || val === null ? null : Number(val)),
    z.number().min(0).max(100).nullish()
  ),
  cbdPotential: z.preprocess(
    (val) => (val === '' || val === null ? null : Number(val)),
    z.number().min(0).max(100).nullish()
  ),
  growthCharacteristics: z.record(z.unknown()).nullish(),
  terpeneProfile: z.record(z.unknown()).nullish(),
  lineage: z.record(z.unknown()).nullish(),
})

export type GeneticFormData = z.infer<typeof geneticFormSchema>

// Use Drizzle's types directly
export interface GeneticWithRelations extends Genetic {
  plants: Plant[]
  batches: Batch[]
  _count?: {
    plants: number
    batches: number
  }
  createdBy?: {
    id: string
    name: string | null
    email: string | null
  }
}
