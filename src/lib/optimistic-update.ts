import { type RouterOutputs, type RouterInputs } from '~/trpc/shared'
import { format } from 'date-fns'

type OptimisticUser = {
  id: string
  name: string | null
  email: string | null
}

export function createOptimisticGenetic(
  input: RouterInputs['genetic']['create'],
  currentUser: OptimisticUser
): RouterOutputs['genetic']['list'][number] {
  return {
    id: Math.floor(Math.random() * -1000000), // Negative ID to avoid conflicts
    name: input.name,
    type: input.type,
    breeder: input.breeder ?? null,
    description: input.description ?? null,
    floweringTime: input.floweringTime ?? null,
    thcPotential: input.thcPotential?.toString() ?? null,
    cbdPotential: input.cbdPotential?.toString() ?? null,
    terpeneProfie: input.terpeneProfie ?? null,
    growthCharacteristics: input.growthCharacteristics ?? null,
    lineage: input.lineage ?? null,
    createdById: currentUser.id,
    createdAt: new Date(),
    updatedAt: null,
    createdBy: {
      id: currentUser.id,
      name: currentUser.name ?? '',
      email: currentUser.email ?? '',
      emailVerified: null,
      image: null,
      role: 'user',
      active: true,
      permissions: null,
      preferences: null,
      lastLogin: null,
      createdAt: new Date(),
    },
  }
}

export function createOptimisticPlant(
  input: RouterInputs['plant']['create'],
  currentUser: OptimisticUser
): RouterOutputs['plant']['list'][number] {
  return {
    id: Math.floor(Math.random() * -1000000),
    code: `temp-${Math.random().toString(36).substring(2, 7)}`,
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
    createdBy: {
      id: currentUser.id,
      name: currentUser.name ?? '',
      email: currentUser.email ?? '',
      emailVerified: null,
      image: null,
      role: 'user',
      active: true,
      permissions: null,
      preferences: null,
      lastLogin: null,
      createdAt: new Date(),
    },
    genetic: null,
    batch: null,
  }
}

export function createOptimisticBatch(
  input: RouterInputs['batch']['create'],
  currentUser: OptimisticUser
): RouterOutputs['batch']['list'][number] {
  return {
    id: Math.floor(Math.random() * -1000000),
    name: input.name,
    code: `BAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    plantCount: input.plantCount,
    notes: input.notes ?? null,
    geneticId: input.geneticId,
    userId: currentUser.id,
    createdAt: new Date(),
    updatedAt: null,
    startDate: new Date(),
    endDate: null,
    status: 'active' as const,
    createdBy: {
      id: currentUser.id,
      name: currentUser.name ?? '',
      email: currentUser.email ?? '',
      emailVerified: null,
      image: null,
      role: 'user',
      active: true,
      permissions: null,
      preferences: null,
      lastLogin: null,
      createdAt: new Date(),
    },
    genetic: {
      id: input.geneticId,
      name: 'Loading...',
      type: 'hybrid',
      createdAt: new Date(),
      createdById: currentUser.id,
      breeder: null,
      description: null,
      floweringTime: null,
      thcPotential: null,
      cbdPotential: null,
      terpeneProfie: null,
      growthCharacteristics: null,
      lineage: null,
      updatedAt: null,
    },
  }
}

export function createOptimisticNote(
  input: RouterInputs['notes']['create'],
  currentUser: OptimisticUser
): RouterOutputs['notes']['list']['items'][number] {
  return {
    id: Math.floor(Math.random() * -1000000),
    content: input.content,
    type: input.type,
    entityType: input.entityType,
    entityId: input.entityId,
    parentId: input.parentId ?? null,
    metadata: input.metadata ?? null,
    createdById: currentUser.id,
    createdAt: new Date(),
    updatedAt: null,
    createdBy: {
      id: currentUser.id,
      name: currentUser.name ?? '',
      email: currentUser.email ?? '',
      emailVerified: null,
      image: null,
      role: 'user',
      active: true,
      permissions: null,
      preferences: null,
      lastLogin: null,
      createdAt: new Date(),
    },
  }
}
