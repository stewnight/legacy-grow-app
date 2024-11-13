import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import { facilities, NewFacility } from '~/server/db/schema'

export const facilityInput = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['indoor', 'outdoor', 'greenhouse']),
  address: z.record(z.unknown()).nullish(),
  license: z.record(z.unknown()).nullish(),
  status: z.enum(['active', 'inactive', 'under_construction']),
  metadata: z.record(z.unknown()).nullish(),
})

export type FacilityFormData = z.infer<typeof facilityInput>

export const facilityRouter = createTRPCRouter({
  get: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const facility = await ctx.db.query.facilities.findFirst({
      where: eq(facilities.id, input),
      with: {
        createdBy: true,
      },
    })

    if (!facility) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Facility not found',
      })
    }

    return facility
  }),

  create: protectedProcedure
    .input(facilityInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const createData = {
          name: input.name,
          type: input.type,
          address: input.address ? JSON.stringify(input.address) : null,
          license: input.license ? JSON.stringify(input.license) : null,
          status: input.status
            ? (input.status as 'Active' | 'Inactive' | 'Under Construction')
            : 'Inactive',
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
          createdById: ctx.session.user.id,
        } satisfies Omit<NewFacility, 'id' | 'createdAt' | 'updatedAt'>

        const [created] = await ctx.db
          .insert(facilities)
          .values(createData as NewFacility)
          .returning()

        return created
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create facility',
          cause: error,
        })
      }
    }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.facilities.findMany({
      orderBy: (facilities) => [facilities.name],
      with: {
        createdBy: true,
      },
    })
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.delete(facilities).where(eq(facilities.id, input.id))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete facility',
          cause: error,
        })
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: facilityInput.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, data } = input
        const updateData: Record<string, unknown> = {}

        if (data.name !== undefined) updateData.name = data.name
        if (data.type !== undefined) updateData.type = data.type
        if (data.address !== undefined) updateData.address = data.address
        if (data.license !== undefined) updateData.license = data.license
        if (data.status !== undefined) updateData.status = data.status
        if (data.metadata !== undefined) updateData.metadata = data.metadata

        updateData.updatedAt = new Date()

        const [updated] = await ctx.db
          .update(facilities)
          .set(updateData)
          .where(eq(facilities.id, id))
          .returning()

        return updated
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update facility',
          cause: error,
        })
      }
    }),
})
