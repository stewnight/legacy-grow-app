import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { eq, ilike } from 'drizzle-orm'
import { genetics } from '~/server/db/schemas'
import { slugify, deslugify } from '~/lib/utils'

export const geneticRouter = createTRPCRouter({
  getByName: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const deslugifiedName = deslugify(input)

      // Try case-sensitive match first
      const genetic = await ctx.db.query.genetics.findFirst({
        where: eq(genetics.name, deslugifiedName),
        with: {
          createdBy: true,
          plants: {
            with: {
              batch: true,
            },
          },
        },
      })

      if (genetic) return genetic

      // Try case-insensitive match if no exact match found
      const caseInsensitiveMatch = await ctx.db.query.genetics.findFirst({
        where: ilike(genetics.name, deslugifiedName),
        with: {
          createdBy: true,
          plants: {
            with: {
              batch: true,
            },
          },
        },
      })

      if (!caseInsensitiveMatch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Genetic "${deslugifiedName}" not found`,
        })
      }

      return caseInsensitiveMatch
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        type: z.enum(['sativa', 'indica', 'hybrid']),
        breeder: z.string().optional(),
        description: z.string().optional(),
        floweringTime: z.number().min(1).max(52).optional(),
        thcPotential: z.number().min(0).max(100).optional(),
        cbdPotential: z.number().min(0).max(100).optional(),
        terpeneProfie: z.record(z.string(), z.number()).optional(),
        growthCharacteristics: z
          .object({
            height: z.number().optional(),
            spread: z.number().optional(),
            internodeSpacing: z.number().optional(),
            leafPattern: z.string().optional(),
          })
          .optional(),
        lineage: z
          .object({
            mother: z.string().optional(),
            father: z.string().optional(),
            generation: z.number().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [genetic] = await ctx.db
        .insert(genetics)
        .values({
          name: input.name,
          type: input.type,
          breeder: input.breeder ?? null,
          description: input.description ?? null,
          floweringTime: input.floweringTime ?? null,
          thcPotential: input.thcPotential?.toString() ?? null,
          cbdPotential: input.cbdPotential?.toString() ?? null,
          createdById: ctx.session.user.id,
          updatedAt: new Date(),
          growthCharacteristics: input.growthCharacteristics ?? null,
          lineage: input.lineage ?? null,
        })
        .returning()

      if (!genetic) {
        throw new Error('Failed to create genetic')
      }

      return genetic
    }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.genetics.findMany({
      orderBy: (genetics) => [genetics.name],
      with: {
        createdBy: true,
      },
    })
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.delete(genetics).where(eq(genetics.id, input.id))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete genetic',
          cause: error,
        })
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        type: z.enum(['sativa', 'indica', 'hybrid']).optional(),
        breeder: z.string().optional(),
        description: z.string().optional(),
        floweringTime: z.number().min(1).max(52).optional(),
        thcPotential: z.number().min(0).max(100).optional(),
        cbdPotential: z.number().min(0).max(100).optional(),
        terpeneProfie: z.record(z.string(), z.number()).optional(),
        growthCharacteristics: z
          .object({
            height: z.number().optional(),
            spread: z.number().optional(),
            internodeSpacing: z.number().optional(),
            leafPattern: z.string().optional(),
          })
          .optional(),
        lineage: z
          .object({
            mother: z.string().optional(),
            father: z.string().optional(),
            generation: z.number().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(genetics)
        .set({
          ...input,
          thcPotential: input.thcPotential?.toString(),
          cbdPotential: input.cbdPotential?.toString(),
          updatedAt: new Date(),
        })
        .where(eq(genetics.id, input.id))
        .returning()

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Genetic not found',
        })
      }

      return updated
    }),
})
