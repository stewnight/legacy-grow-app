import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { rooms, insertRoomSchema } from '~/server/db/schema'
import { eq, desc, like, and, SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { roomTypeEnum, statusEnum } from '~/server/db/schema/enums'

// Define the type for the JSON fields based on your schema
type RoomProperties = typeof rooms.$inferInsert.properties
type RoomDimensions = typeof rooms.$inferInsert.dimensions

// Schema for filters
const roomFiltersSchema = z.object({
  type: z.enum(roomTypeEnum.enumValues).optional(),
  status: z.enum(statusEnum.enumValues).optional(),
  search: z.string().optional(),
  buildingId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
})

export const roomRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: roomFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.type ? eq(rooms.type, filters.type) : undefined,
        filters?.status ? eq(rooms.status, filters.status) : undefined,
        filters?.search ? like(rooms.name, `%${filters.search}%`) : undefined,
        filters?.buildingId ? eq(rooms.buildingId, filters.buildingId) : undefined,
        filters?.parentId ? eq(rooms.parentId, filters.parentId) : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.rooms.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(rooms.createdAt)],
        with: {
          building: true,
          parent: true,
          children: true,
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

  get: protectedProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const room = await ctx.db.query.rooms.findFirst({
      where: eq(rooms.id, input),
      with: {
        building: true,
        parent: true,
        children: true,
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!room) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Room not found',
      })
    }

    return room
  }),

  create: protectedProcedure.input(insertRoomSchema).mutation(async ({ ctx, input }) => {
    const insertData = {
      ...input,
      createdById: ctx.session.user.id,
      properties: input.properties as RoomProperties,
      dimensions: input.dimensions as RoomDimensions,
    }

    const [room] = await ctx.db.insert(rooms).values(insertData).returning()

    if (!room) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create room',
      })
    }

    return room
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertRoomSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData = {
        ...input.data,
        updatedAt: new Date(),
        properties: input.data.properties as RoomProperties,
        dimensions: input.data.dimensions as RoomDimensions,
      }

      const [room] = await ctx.db
        .update(rooms)
        .set(updateData)
        .where(eq(rooms.id, input.id))
        .returning()

      if (!room) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Room not found',
        })
      }

      return room
    }),

  delete: protectedProcedure.input(z.string().uuid()).mutation(async ({ ctx, input }) => {
    const [deleted] = await ctx.db.delete(rooms).where(eq(rooms.id, input)).returning()

    if (!deleted) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Room not found',
      })
    }

    return { success: true }
  }),
})
