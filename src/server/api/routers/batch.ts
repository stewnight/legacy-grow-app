import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { batches, insertBatchSchema } from '~/server/db/schema/cultivation'
import { batchStatusEnum } from '~/server/db/schema/enums'
import { eq, desc, like, and, SQL } from 'drizzle-orm'

const batchFiltersSchema = z.object({
  status: z.enum(batchStatusEnum.enumValues).optional(),
  search: z.string().optional(),
})

export const batchRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: batchFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.status ? eq(batches.status, filters.status) : undefined,
        filters?.search ? like(batches.code, `%${filters.search}%`) : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.batches.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(batches.createdAt)],
        with: {
          genetic: true,
          location: true,
          plants: true,
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > limit) {
        items.pop()
        nextCursor = cursor ? cursor + limit : limit
      }

      return { items, nextCursor }
    }),

  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.query.batches.findFirst({
      where: eq(batches.code, input),
      with: {
        genetic: true,
        location: true,
        plants: true,
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }),

  create: protectedProcedure
    .input(
      insertBatchSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [batch] = await ctx.db
        .insert(batches)
        .values({
          ...input,
          createdById: ctx.session.user.id,
        })
        .returning()

      return batch
    }),

  update: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        data: insertBatchSchema.partial().omit({
          id: true,
          createdAt: true,
          updatedAt: true,
          createdById: true,
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [batch] = await ctx.db
        .update(batches)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(batches.code, input.code))
        .returning()

      return batch
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(batches).where(eq(batches.code, input))
    }),
})
