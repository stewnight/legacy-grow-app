import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { notes } from '~/server/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { noteTypeEnum, statusEnum } from '~/server/db/schema/enums'

const noteMetadataSchema = z
  .object({
    duration: z.number().optional(),
    dimensions: z
      .object({
        width: z.number(),
        height: z.number(),
      })
      .optional(),
    fileSize: z.number().optional(),
    mimeType: z.string().optional(),
  })
  .nullable()
  .optional()

export const notesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        type: z.enum(noteTypeEnum.enumValues),
        entityType: z.string(),
        entityId: z.string().uuid(),
        parentId: z.string().uuid().optional(),
        metadata: noteMetadataSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { metadata, ...rest } = input

      const [note] = await ctx.db
        .insert(notes)
        .values({
          ...rest,
          metadata: (metadata as typeof notes.$inferInsert.metadata) || null,
          createdById: ctx.session.user.id,
        })
        .returning()

      return note
    }),

  list: protectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { entityType, entityId, limit, cursor } = input

      const items = await ctx.db.query.notes.findMany({
        where: and(
          eq(notes.entityType, entityType),
          eq(notes.entityId, entityId),
          cursor ? eq(notes.id, cursor) : undefined
        ),
        limit: limit + 1,
        orderBy: [desc(notes.createdAt)],
        with: {
          createdBy: true,
        },
      })

      let nextCursor: string | undefined = undefined
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem?.id
      }

      return {
        items,
        nextCursor,
      }
    }),

  getThread: protectedProcedure
    .input(
      z.object({
        noteId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const thread = await ctx.db.query.notes.findMany({
        where: eq(notes.parentId, input.noteId),
        orderBy: [desc(notes.createdAt)],
        with: {
          createdBy: true,
        },
      })
      return thread
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        content: z.string(),
        metadata: noteMetadataSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { metadata, ...rest } = input

      const [updated] = await ctx.db
        .update(notes)
        .set({
          ...rest,
          metadata: (metadata as typeof notes.$inferInsert.metadata) || null,
          updatedAt: new Date(),
        })
        .where(eq(notes.id, input.id))
        .returning()

      return updated
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(notes)
        .where(eq(notes.id, input.id))
        .returning()

      return deleted
    }),
})
