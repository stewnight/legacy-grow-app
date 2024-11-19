import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc'
import { geneticRouter } from './routers/genetic'
import { batchRouter } from './routers/batch'
import { plantRouter } from './routers/plant'
import { notesRouter } from './routers/notes'
import { mediaRouter } from './routers/media'
import { locationRouter } from './routers/location'
import { areaRouter } from './routers/area'
import { facilityRouter } from './routers/facility'
import { sensorRouter } from './routers/sensor'
import { taskRouter } from './routers/task'
import { harvestRouter } from './routers/harvest'
import { processingRouter } from './routers/processing'
import { userRouter } from './routers/user'

export const appRouter = createTRPCRouter({
  genetic: geneticRouter,
  batch: batchRouter,
  plant: plantRouter,
  notes: notesRouter,
  media: mediaRouter,
  location: locationRouter,
  area: areaRouter,
  facility: facilityRouter,
  sensor: sensorRouter,
  task: taskRouter,
  harvest: harvestRouter,
  processing: processingRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
