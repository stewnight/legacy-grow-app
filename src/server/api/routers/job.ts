import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { jobs, insertJobSchema } from '~/server/db/schema'
import { eq, desc, like, and, SQL, asc, sql } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import {
  jobStatusEnum,
  jobPriorityEnum,
  jobCategoryEnum,
  statusEnum,
  jobEntityTypeEnum,
  type JobEntityType,
} from '~/server/db/schema/enums'

// Schema for filters using the enum directly
const jobFiltersSchema = z.object({
  jobStatus: z.enum(jobStatusEnum.enumValues).optional(),
  entityType: z.enum(jobEntityTypeEnum.enumValues).optional(),
  entityId: z.string().uuid().optional(),
  priority: z.enum(jobPriorityEnum.enumValues).optional(),
  category: z.enum(jobCategoryEnum.enumValues).optional(),
  assignedToId: z.string().uuid().optional(),
  status: z.enum(statusEnum.enumValues).optional(),
  search: z.string().optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
})

const sortSchema = z.object({
  field: z.enum(['priority', 'dueDate', 'jobStatus', 'createdAt']),
  direction: z.enum(['asc', 'desc']),
})

export const jobRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        filters: jobFiltersSchema.optional(),
        sort: sortSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filters, sort } = input

      const conditions = [
        filters?.jobStatus ? eq(jobs.jobStatus, filters.jobStatus) : undefined,
        filters?.priority ? eq(jobs.priority, filters.priority) : undefined,
        filters?.category ? eq(jobs.category, filters.category) : undefined,
        filters?.assignedToId
          ? eq(jobs.assignedToId, filters.assignedToId)
          : undefined,
        filters?.status ? eq(jobs.status, filters.status) : undefined,
        filters?.search ? like(jobs.title, `%${filters.search}%`) : undefined,
        filters?.entityType
          ? eq(jobs.entityType, filters.entityType)
          : undefined,
        filters?.dueDateFrom
          ? sql`${jobs.dueDate} >= ${filters.dueDateFrom}`
          : undefined,
        filters?.dueDateTo
          ? sql`${jobs.dueDate} <= ${filters.dueDateTo}`
          : undefined,
      ].filter((condition): condition is SQL => condition !== undefined)

      let orderBy: SQL[] = [desc(jobs.createdAt)]
      if (sort) {
        switch (sort.field) {
          case 'priority':
            orderBy = [
              sort.direction === 'asc'
                ? asc(jobs.priority)
                : desc(jobs.priority),
              desc(jobs.createdAt),
            ]
            break
          case 'dueDate':
            orderBy = [
              sort.direction === 'asc' ? asc(jobs.dueDate) : desc(jobs.dueDate),
              desc(jobs.createdAt),
            ]
            break
          case 'jobStatus':
            orderBy = [
              sort.direction === 'asc'
                ? asc(jobs.jobStatus)
                : desc(jobs.jobStatus),
              desc(jobs.createdAt),
            ]
            break
          case 'createdAt':
            orderBy = [
              sort.direction === 'asc'
                ? asc(jobs.createdAt)
                : desc(jobs.createdAt),
            ]
            break
        }
      }

      const items = await ctx.db.query.jobs.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        limit: limit + 1,
        offset: cursor || 0,
        orderBy,
        with: {
          assignedTo: {
            columns: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            columns: {
              id: true,
              name: true,
            },
          },
          notes: true,
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
      const job = await ctx.db.query.jobs.findFirst({
        where: eq(jobs.id, input),
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
          location: true,
          plant: true,
          batch: true,
          genetic: true,
          sensor: true,
          processing: true,
          harvest: true,
        },
      })

      if (!job) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job not found',
        })
      }

      return job
    }),

  create: protectedProcedure
    .input(insertJobSchema)
    .mutation(async ({ ctx, input }) => {
      const [job] = await ctx.db
        .insert(jobs)
        .values({
          ...input,
          createdById: ctx.session.user.id,
          properties: input.properties ?? {},
          metadata: input.metadata ?? {},
        } as typeof jobs.$inferInsert)
        .returning()

      if (!job) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create job',
        })
      }

      return job
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertJobSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [job] = await ctx.db
        .update(jobs)
        .set({
          ...input.data,
          updatedAt: new Date(),
          properties: input.data.properties ?? undefined,
          metadata: input.data.metadata ?? undefined,
        } as Partial<typeof jobs.$inferInsert>)
        .where(eq(jobs.id, input.id))
        .returning()

      if (!job) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job not found',
        })
      }

      return job
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(jobs)
        .where(eq(jobs.id, input))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job not found',
        })
      }

      return { success: true }
    }),
})
