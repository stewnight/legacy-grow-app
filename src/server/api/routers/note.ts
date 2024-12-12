import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { notes, insertNoteSchema } from '~/server/db/schema'
import { eq, desc, and, type SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { noteTypeEnum, statusEnum } from '~/server/db/schema/enums'

// Schema for filters
const noteFiltersSchema = z.object({
  type: z.enum(noteTypeEnum.enumValues).optional(),
  status: z.enum(statusEnum.enumValues).optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
})

export const noteRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: noteFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.type ? eq(notes.type, filters.type) : undefined,
        filters?.status ? eq(notes.status, filters.status) : undefined,
        filters?.entityType ? eq(notes.entityType, filters.entityType) : undefined,
        filters?.entityId ? eq(notes.entityId, filters.entityId) : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.notes.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(notes.createdAt)],
        with: {
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

  getAllForJob: protectedProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const note = await ctx.db.query.notes.findMany({
      where: eq(notes.entityId, input),
      with: {
        parent: true,
        children: true,
        createdBy: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    if (!note) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Notes not found',
      })
    }

    return note
  }),

  get: protectedProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const note = await ctx.db.query.notes.findFirst({
      where: eq(notes.id, input),
      with: {
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

    if (!note) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Note not found',
      })
    }

    return note
  }),

  create: protectedProcedure.input(insertNoteSchema).mutation(async ({ ctx, input }) => {
    const [note] = await ctx.db
      .insert(notes)
      .values({
        ...input,
        createdById: ctx.session.user.id,
      } as typeof notes.$inferInsert)
      .returning()

    if (!note) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create note',
      })
    }

    return note
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertNoteSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [note] = await ctx.db
        .update(notes)
        .set({
          ...input.data,
          updatedAt: new Date(),
        } as typeof notes.$inferInsert)
        .where(eq(notes.id, input.id))
        .returning()

      if (!note) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Note not found',
        })
      }

      return note
    }),

  delete: protectedProcedure.input(z.string().uuid()).mutation(async ({ ctx, input }) => {
    const [deleted] = await ctx.db.delete(notes).where(eq(notes.id, input)).returning()

    if (!deleted) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Note not found',
      })
    }

    return { success: true }
  }),
})
