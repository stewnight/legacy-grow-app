import { type QueryClient } from '@tanstack/react-query'
import { type RouterInputs } from '~/trpc/shared'
import {
  type Genetic,
  type Plant,
  type Batch,
  type Note,
} from '~/server/db/schema'
import { slugify } from '~/lib/utils'
import { format } from 'date-fns'

type OptimisticUser = {
  id: string
  name: string | null
  email: string | null
}

// Generic optimistic ID generator
function generateOptimisticId(): number {
  return Math.floor(Math.random() * -1000000)
}

// Generic optimistic creation helper
function createOptimisticEntity<T extends { id: number }>(
  data: Partial<T>,
  baseEntity: Partial<T>
): T {
  return {
    ...baseEntity,
    ...data,
    id: generateOptimisticId(),
  } as T
}

// Genetic optimistic helpers
export function createOptimisticGenetic(
  input: RouterInputs['genetic']['create'],
  currentUser: OptimisticUser
): Genetic {
  return createOptimisticEntity<Genetic>(
    {
      name: input.name,
      slug: slugify(input.name),
      type: input.type,
      breeder: input.breeder ?? null,
      description: input.description ?? null,
      floweringTime: input.floweringTime ?? null,
      thcPotential: input.thcPotential?.toString() ?? null,
      cbdPotential: input.cbdPotential?.toString() ?? null,
      terpeneProfile: input.terpeneProfile! ?? null,
      growthCharacteristics: input.growthCharacteristics ?? null,
      lineage: input.lineage ?? null,
      createdById: currentUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {}
  )
}

// Plant optimistic helpers
export function createOptimisticPlant(
  input: RouterInputs['plant']['create'],
  currentUser: OptimisticUser
): Plant {
  return createOptimisticEntity<Plant>(
    {
      code: `temp-${Math.random().toString(36).substring(2, 7)}`,
      status: 'active',
      batchId: input.batchId ?? null,
      source: input.source,
      stage: input.stage,
      plantDate: format(input.plantDate, 'yyyy-MM-dd'),
      harvestDate: null,
      healthStatus: input.healthStatus ?? 'healthy',
      quarantine: input.quarantine ?? false,
      geneticId: input.geneticId ?? null,
      motherId: input.motherId ?? null,
      generation: input.generation ?? null,
      sex: input.sex ?? 'unknown',
      phenotype: input.phenotype ?? null,
      locationId: input.locationId ?? null,
      destroyReason: input.destroyReason ?? null,
      createdById: currentUser.id,
      createdAt: new Date(),
      updatedAt: null,
    },
    {}
  )
}

// Batch optimistic helpers
export function createOptimisticBatch(
  input: RouterInputs['batch']['create'],
  currentUser: OptimisticUser
): Batch {
  return createOptimisticEntity<Batch>(
    {
      name: input.name,
      code: `b${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      geneticId: input.geneticId,
      plantCount: input.plantCount,
      notes: input.notes ?? null,
      status: 'active',
      userId: currentUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {}
  )
}

// Note optimistic helpers
export function createOptimisticNote(
  input: RouterInputs['notes']['create'],
  currentUser: OptimisticUser
): Note {
  return createOptimisticEntity<Note>(
    {
      content: input.content,
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      parentId: input.parentId ?? null,
      metadata: input.metadata ?? null,
      createdById: currentUser.id,
      createdAt: new Date(),
      updatedAt: null,
    },
    {}
  )
}

// Generic optimistic update helper
export function updateOptimisticEntity<T>(current: T, updates: Partial<T>): T {
  return {
    ...current,
    ...updates,
    updatedAt: new Date(),
  }
}

// Generic helpers for optimistic operations
export function isOptimisticId(id: number): boolean {
  return id < 0
}

export function mergeOptimisticData<T extends { id: number }>(
  serverData: T[],
  optimisticData: T[],
  identifierKey: keyof T = 'id'
): T[] {
  const optimisticMap = new Map(
    optimisticData.map((item) => [item[identifierKey], item])
  )

  return serverData.map((item) =>
    optimisticMap.has(item[identifierKey])
      ? optimisticMap.get(item[identifierKey])!
      : item
  )
}

export function handleOptimisticError<T extends { id: number }>(
  error: Error,
  queryClient: QueryClient,
  entityType: string,
  entityId: number
): void {
  queryClient.setQueryData<T[]>(
    [entityType, 'list'],
    (old) => old?.filter((item) => item.id !== entityId) ?? []
  )

  queryClient.setQueryData(
    [entityType, 'errors'],
    (old: Record<string, Error> = {}) => ({
      ...old,
      [entityId]: error,
    })
  )
}
