import { z } from 'zod'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { type AppRouter } from '~/server/api/root'

type RouterInput = inferRouterInputs<AppRouter>
type RouterOutput = inferRouterOutputs<AppRouter>

interface CreateRouterOptions<TSchema> {
  inputSchema: z.ZodType<TSchema>
  create: {
    handler: (input: TSchema) => Promise<TSchema>
  }
  list: {
    handler: () => Promise<TSchema[]>
  }
  update: {
    handler: (id: number, input: Partial<TSchema>) => Promise<TSchema>
  }
  delete: {
    handler: (id: number) => Promise<TSchema>
  }
  get: {
    handler: (code?: string, id?: number) => Promise<TSchema>
  }
}

export function createRouter<TSchema>({
  inputSchema,
  create,
  list,
  update,
  delete: deleteHandler,
  get,
}: CreateRouterOptions<TSchema>) {
  return createTRPCRouter({
    create: protectedProcedure
      .input(inputSchema)
      .mutation(async ({ input }) => {
        try {
          return await create.handler(input as TSchema)
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create record',
            cause: error,
          })
        }
      }),

    list: protectedProcedure.query(async () => {
      try {
        return await list.handler()
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch records',
          cause: error,
        })
      }
    }),

    get: protectedProcedure
      .input(z.union([z.string(), z.number()]))
      .query(async ({ input }) => {
        try {
          return await get.handler(input as string)
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch record',
            cause: error,
          })
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: inputSchema as z.ZodType<Partial<TSchema>>,
        })
      )
      .mutation(async ({ input }) => {
        try {
          return await update.handler(
            input?.id as number,
            input?.data as Partial<TSchema>
          )
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update record',
            cause: error,
          })
        }
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input: id }) => {
        try {
          return await deleteHandler.handler(id)
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete record',
            cause: error,
          })
        }
      }),
  })
}
