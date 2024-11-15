import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { tasks, insertTaskSchema } from '~/server/db/schema'
import { eq, desc, like, and, SQL } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import {
  taskStatusEnum,
  taskPriorityEnum,
  taskCategoryEnum,
  statusEnum,
} from '~/server/db/schema/enums'

// Schema for filters
const taskFiltersSchema = z.object({
  status: z.enum(taskStatusEnum.enumValues).optional(),
  priority: z.enum(taskPriorityEnum.enumValues).optional(),
  category: z.enum(taskCategoryEnum.enumValues).optional(),
  assignedToId: z.string().uuid().optional(),
  search: z.string().optional(),
})

export const taskRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: taskFiltersSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters } = input

      const conditions = [
        filters?.status ? eq(tasks.taskStatus, filters.status) : undefined,
        filters?.priority ? eq(tasks.priority, filters.priority) : undefined,
        filters?.category ? eq(tasks.category, filters.category) : undefined,
        filters?.assignedToId
          ? eq(tasks.assignedToId, filters.assignedToId)
          : undefined,
        filters?.search ? like(tasks.title, `%${filters.search}%`) : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      const items = await ctx.db.query.tasks.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy: [desc(tasks.createdAt)],
        with: {
          assignedTo: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
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
      const task = await ctx.db.query.tasks.findFirst({
        where: eq(tasks.id, input),
        with: {
          assignedTo: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
          notes: true,
        },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      return task
    }),

  create: protectedProcedure
    .input(
      insertTaskSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { properties, metadata, ...rest } = input

      const [task] = await ctx.db
        .insert(tasks)
        .values({
          ...rest,
          properties: properties as typeof tasks.$inferInsert.properties,
          metadata: metadata as typeof tasks.$inferInsert.metadata,
          createdById: ctx.session.user.id,
        })
        .returning()

      if (!task) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create task',
        })
      }

      return task
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertTaskSchema.partial().omit({
          id: true,
          createdAt: true,
          updatedAt: true,
          createdById: true,
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { properties, metadata, ...rest } = input.data

      const [task] = await ctx.db
        .update(tasks)
        .set({
          ...rest,
          properties: properties as typeof tasks.$inferInsert.properties,
          metadata: metadata as typeof tasks.$inferInsert.metadata,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, input.id))
        .returning()

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      return task
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(tasks)
        .where(eq(tasks.id, input))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      return { success: true }
    }),
})