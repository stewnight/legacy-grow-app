import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { equipment, insertEquipmentSchema } from '~/server/db/schema/equipment'
import { eq, desc, like, and, SQL, not, isNull, lte } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import {
  equipmentTypeEnum,
  equipmentStatusEnum,
} from '~/server/db/schema/enums'
import { maintenanceRecords } from '~/server/db/schema/equipment'
import { rooms } from '~/server/db/schema/rooms'
import { sensors } from '~/server/db/schema/sensors'
import { users } from '~/server/db/schema/users'

// Schema for filters
const equipmentFiltersSchema = z.object({
  type: z.enum(equipmentTypeEnum.enumValues).optional(),
  status: z.enum(equipmentStatusEnum.enumValues).optional(),
  search: z.string().optional(),
  maintenanceNeeded: z.boolean().optional(),
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
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.equipment.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(equipment.createdAt)],
        with: {
          roomAssignments: {
            with: {
              room: true,
            },
          },
          maintenanceRecords: {
            orderBy: [desc(maintenanceRecords.maintenanceDate)],
            limit: 1,
          },
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

  get: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.query.equipment.findFirst({
        where: eq(equipment.id, input),
        with: {
          roomAssignments: {
            with: {
              room: true,
              assignedBy: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          maintenanceRecords: {
            with: {
              performedBy: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: [desc(maintenanceRecords.maintenanceDate)],
          },
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

      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Equipment not found',
        })
      }

      return item
    }),

  create: protectedProcedure
    .input(insertEquipmentSchema)
    .mutation(async ({ ctx, input }) => {
      const [item] = await ctx.db
        .insert(equipment)
        .values({
          ...input,
          createdById: ctx.session.user.id,
          metadata: input.metadata || {},
          specifications: input.specifications || {},
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
        id: z.string().uuid(),
        data: insertEquipmentSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [item] = await ctx.db
        .update(equipment)
        .set({
          ...input.data,
          updatedAt: new Date(),
          metadata: input.data.metadata || {},
          specifications: input.data.specifications || {},
        } as typeof equipment.$inferInsert)
        .where(eq(equipment.id, input.id))
        .returning()

      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Equipment not found',
        })
      }

      return item
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(equipment)
        .where(eq(equipment.id, input))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Equipment not found',
        })
      }

      return { success: true }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.equipment.findFirst({
        where: eq(equipment.id, input.id),
        with: {
          createdBy: true,
          roomAssignments: {
            with: {
              room: true,
            },
          },
          sensors: true,
        },
      })

      return result
    }),
})
