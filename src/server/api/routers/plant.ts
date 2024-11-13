import { createRouter } from '~/lib/create-router'
import { Plant, plants } from '~/server/db/schema'
import { plantFormSchema } from '~/lib/validations/plant'
import { eq } from 'drizzle-orm'
import { db } from '~/server/db'

export const plantRouter = createRouter({
  inputSchema: plantFormSchema,

  create: {
    handler: async (input) => {
      const [plant] = await db.insert(plants).values(input).returning()
      return plant
    },
  },

  list: {
    handler: async () => {
      return db.query.plants.findMany({
        with: {
          genetic: true,
          batch: true,
        },
      })
    },
  },

  get: {
    handler: async (code: string) => {
      return db.query.plants.findFirst({
        where: eq(plants.code, code),
        with: {
          genetic: true,
          batch: true,
        },
      })
    },
  },

  update: {
    handler: async (id, input) => {
      const [updated] = await db
        .update(plants)
        .set(input as Partial<Plant>)
        .where(eq(plants.id, id))
        .returning()
      return updated
    },
  },

  delete: {
    handler: async (id) => {
      const [deleted] = await db
        .delete(plants)
        .where(eq(plants.id, id))
        .returning()
      return deleted
    },
  },
})
