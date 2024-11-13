import { z } from 'zod'
import {
  plantSourceEnum,
  plantStageEnum,
  plantSexEnum,
  healthStatusEnum,
} from '~/server/db/schema/enums'

export const plantFormSchema = z.object({
  geneticId: z.string().uuid().optional(),
  batchId: z.string().uuid().optional(),
  source: z.enum(plantSourceEnum.enumValues),
  stage: z.enum(plantStageEnum.enumValues),
  plantDate: z.date().optional(),
  harvestDate: z.date().optional(),
  motherId: z.string().uuid().optional(),
  generation: z.number().optional(),
  sex: z.enum(plantSexEnum.enumValues),
  phenotype: z.string().optional(),
  healthStatus: z.enum(healthStatusEnum.enumValues),
  quarantine: z.boolean().optional(),
  locationId: z.string().uuid().optional(),
  notes: z.string().optional(),
})

export type PlantFormData = z.infer<typeof plantFormSchema>
