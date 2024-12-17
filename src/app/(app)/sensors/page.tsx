import { Suspense } from 'react'
import { Skeleton } from '~/components/ui/skeleton'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { DataTable } from '~/components/ui/data-table'
import {
  columns,
  SensorsTableFilters,
} from '~/components/sensors/sensors-columns'
import { api } from '~/trpc/server'
import { AppSheet } from '~/components/layout/app-sheet'
import { SensorForm } from '~/components/sensors/sensors-form'
import { type SensorWithRelations } from '~/server/db/schema'
import { SensorsDashboard } from '~/components/sensors/sensors-dashboard'

export default async function SensorsPage() {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  const { items: sensorsData } = await api.sensor.getAll({
    limit: 100,
  })

  const sensors = sensorsData.map((sensor) => ({
    ...sensor,
    createdBy: {
      id: sensor.createdBy.id,
      name: sensor.createdBy.name ?? 'Unknown User',
      image: sensor.createdBy.image ?? '',
    },
    location: sensor.location ?? undefined,
    equipment: sensor.equipment,
    jobs: sensor.jobs ?? [],
    notes: sensor.notes ?? [],
    readings: sensor.readings ?? [],
  }))

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Sensors</h2>
        <AppSheet mode="create" entity="sensor">
          <SensorForm mode="create" />
        </AppSheet>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-[150px]" />
          </div>
        }
      >
        <SensorsDashboard sensors={sensors as SensorWithRelations[]} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={sensors as SensorWithRelations[]}
            enableFiltering
            enableColumnFilters
            filters={<SensorsTableFilters />}
          />
        </div>
      </Suspense>
    </div>
  )
}
