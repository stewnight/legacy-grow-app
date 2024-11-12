import { z } from 'zod'
import { type Batch, type Genetic, type Plant } from '~/server/db/schema'

export const healthStatusEnum = z.enum(['healthy', 'sick', 'pest', 'nutrient'])
export type HealthStatus = z.infer<typeof healthStatusEnum>

export const plantFormSchema = z.object({
  batchId: z.number().optional(),
  source: z.enum(['seed', 'clone', 'mother']),
  stage: z.enum(['seedling', 'vegetative', 'flowering', 'harvested']),
  plantDate: z.date(),
  harvestDate: z.date().optional(),
  notes: z.string().optional(),
  healthStatus: healthStatusEnum,
  quarantine: z.boolean().default(false),
  geneticId: z.number().optional(),
  motherId: z.number().optional(),
  generation: z.number().optional(),
  sex: z.enum(['male', 'female', 'hermaphrodite', 'unknown']),
  phenotype: z.string().optional(),
  locationId: z.number().optional(),
  destroyReason: z.string().optional(),
})

export type PlantFormData = z.infer<typeof plantFormSchema>

export interface PlantWithRelations extends Omit<Plant, 'genetic' | 'batch'> {
  genetic: Genetic | null
  batch: Batch | null

  createdBy: {
    id: string
    name: string | null
    email: string | null
  }
}
