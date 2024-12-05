import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc';
import { geneticRouter } from './routers/genetic';
import { batchRouter } from './routers/batch';
import { plantRouter } from './routers/plant';
import { noteRouter } from './routers/note';
import { mediaRouter } from './routers/media';
import { locationRouter } from './routers/location';
import { roomRouter } from './routers/room';
import { buildingRouter } from './routers/building';
import { sensorRouter } from './routers/sensor';
import { jobRouter } from './routers/job';
import { harvestRouter } from './routers/harvest';
import { processingRouter } from './routers/processing';
import { userRouter } from './routers/user';

export const appRouter = createTRPCRouter({
  genetic: geneticRouter,
  batch: batchRouter,
  plant: plantRouter,
  note: noteRouter,
  media: mediaRouter,
  location: locationRouter,
  room: roomRouter,
  building: buildingRouter,
  sensor: sensorRouter,
  job: jobRouter,
  harvest: harvestRouter,
  processing: processingRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
