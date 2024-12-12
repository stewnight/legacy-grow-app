import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { equipment, insertEquipmentSchema } from '~/server/db/schema/equipment'
import { eq, desc, like, and, type SQL, not, isNull, lte } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import {
  equipmentTypeEnum,
  equipmentStatusEnum,
} from '~/server/db/schema/enums'

// Schema for filters
const equipmentFiltersSchema = z.object({
  type: z.enum(equipmentTypeEnum.enumValues).optional(),
  status: z.enum(equipmentStatusEnum.enumValues).optional(),
  search: z.string().optional(),
  maintenanceNeeded: z.boolean().optional(),
  roomId: z.string().optional(),
})

export const equipmentRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: equipmentFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.type ? eq(equipment.type, filters.type) : undefined,
        filters?.status ? eq(equipment.status, filters.status) : undefined,
        filters?.search
          ? like(equipment.name, `%${filters.search}%`)
          : undefined,
        filters?.maintenanceNeeded
          ? and(
              not(isNull(equipment.nextMaintenanceDate)),
              lte(equipment.nextMaintenanceDate, new Date())
            )
          : undefined,
        filters?.roomId ? eq(equipment.roomId, filters.roomId) : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.equipment.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor ?? 0,
        orderBy: [desc(equipment.createdAt)],
        with: {
          room: true,
          location: true,
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

  getById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.equipment.findFirst({
        where: eq(equipment.id, input),
        with: {
          room: true,
          location: true,
          sensors: true,
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Equipment not found',
        })
      }

      return result
    }),

  getUnassigned: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.equipment.findMany({
      where: isNull(equipment.roomId),
      orderBy: [desc(equipment.createdAt)],
    })
  }),

  create: protectedProcedure
    .input(insertEquipmentSchema)
    .mutation(async ({ ctx, input }) => {
      const [item] = await ctx.db
        .insert(equipment)
        .values({
          ...input,
          createdById: ctx.session.user.id,
          metadata: input.metadata ?? {},
          specifications: input.specifications ?? {},
        } as typeof equipment.$inferInsert)
        .returning()

      if (!item) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create equipment',
        })
      }

      return item
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: insertEquipmentSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(equipment)
        .set({
          ...input.data,
          updatedAt: new Date(),
          metadata: input.data.metadata ?? {},
          specifications: input.data.specifications ?? {},
        } as typeof equipment.$inferInsert)
        .where(eq(equipment.id, input.id))
        .returning()

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Equipment not found',
        })
      }

      return updated
    }),

  assignRoom: protectedProcedure
    .input(
      z.object({
        equipmentId: z.string(),
        roomId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(equipment)
        .set({
          roomId: input.roomId,
          updatedAt: new Date(),
        })
        .where(eq(equipment.id, input.equipmentId))
        .returning()

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Equipment not found',
        })
      }

      return updated
    }),

  unassignRoom: protectedProcedure
    .input(z.object({ equipmentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(equipment)
        .set({
          roomId: null,
          updatedAt: new Date(),
        })
        .where(eq(equipment.id, input.equipmentId))
        .returning()

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Equipment not found',
        })
      }

      return updated
    }),
})
