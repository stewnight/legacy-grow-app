import { z } from 'zod'
import { type Batch, type Plant } from '~/server/db/schema'

export const batchFormSchema = z.object({
  name: z.string().min(1, 'Batch name is required'),
  geneticId: z.number(),
  plantCount: z.number().min(1, 'Must have at least 1 plant'),
  notes: z.string().nullish(),
  source: z.enum(['seed', 'clone', 'mother']).nullish(),
  stage: z.enum(['seedling', 'vegetative', 'flowering']).nullish(),
  plantDate: z.date().nullish(),
  healthStatus: z.enum(['healthy', 'sick', 'pest', 'nutrient']).nullish(),
  motherId: z.number().nullish(),
  generation: z.number().nullish(),
  sex: z.enum(['male', 'female', 'hermaphrodite', 'unknown']).nullish(),
  phenotype: z.string().nullish(),
  locationId: z.number().nullish(),
})
export type BatchFormData = z.infer<typeof batchFormSchema>

export interface BatchWithRelations extends Partial<Batch> {
  plants: Plant[]
  genetic: {
    id: number
    name: string
    slug: string
  } | null
  _count: {
    plants: number
  }
  createdBy: {
    id: string
    name: string | null
    email: string | null
  }
  source?: 'seed' | 'clone' | 'mother'
  stage?: 'seedling' | 'vegetative' | 'flowering'
  plantDate?: Date | null
  healthStatus?: 'healthy' | 'sick' | 'pest' | 'nutrient'
  motherId?: number | null
  generation?: number | null
  sex?: 'male' | 'female' | 'hermaphrodite' | 'unknown' | null
  phenotype?: string | null
  locationId?: number | null
}
