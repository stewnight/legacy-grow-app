import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc'
import { geneticRouter } from './routers/genetic'
import { batchRouter } from './routers/batch'
import { plantRouter } from './routers/plant'
import { notesRouter } from './routers/notes'
import { mediaRouter } from './routers/media'

export const appRouter = createTRPCRouter({
  genetic: geneticRouter,
  batch: batchRouter,
  plant: plantRouter,
  notes: notesRouter,
  media: mediaRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
