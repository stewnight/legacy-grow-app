import { z } from 'zod'
import { desc, eq, and } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { notes } from '~/server/db/schemas'

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
        type: z.enum(['text', 'voice', 'image', 'file']),
        entityType: z.string(),
        entityId: z.number(),
        parentId: z.number().optional(),
        metadata: noteMetadataSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [note] = await ctx.db
        .insert(notes)
        .values({
          content: input.content,
          type: input.type,
          entityType: input.entityType,
          entityId: input.entityId,
          parentId: input.parentId,
          metadata: input.metadata ?? null,
          createdById: ctx.session.user.id,
        })
        .returning()
      return note
    }),

  list: protectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.number(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.number().optional(),
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

      let nextCursor: typeof cursor | undefined = undefined
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
        noteId: z.number(),
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
        id: z.number(),
        content: z.string(),
        metadata: noteMetadataSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(notes)
        .set({
          content: input.content,
          metadata: input.metadata,
          updatedAt: new Date(),
        })
        .where(eq(notes.id, input.id))
        .returning()
      return updated
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
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
