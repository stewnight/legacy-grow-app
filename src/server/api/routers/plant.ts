import { insertPlantSchema, NewPlant, Plant, plants } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { z } from 'zod'

export const plantRouter = createTRPCRouter({
  create: protectedProcedure
    .input(insertPlantSchema)
    .mutation(async ({ ctx, input }): Promise<Plant> => {
      const [plant] = await ctx.db.insert(plants).values(input).returning()
      return plant
    }),

  list: protectedProcedure.query(async () => {
    return db.query.plants.findMany({
      with: {
        genetic: true,
        batch: true,
      },
    })
  }),

  get: protectedProcedure.input(z.string()).query(async ({ input }) => {
    return db.query.plants.findFirst({
      where: eq(plants.code, input),
      with: { genetic: true, batch: true },
    })
  }),
})
