import { Suspense } from 'react'
import { PlantList } from './_components/plant-list'
import { Skeleton } from '~/components/ui/skeleton'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { PlantErrorBoundary } from './_components/plant-error-boundary'
import { BaseSheet } from '../../components/base-sheet'
import { PlantForm } from './_components/plant-form'
import { api } from '~/trpc/react'
import { DataTable } from '~/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plant } from '../../server/db/schema'

export default async function PlantsPage() {
  const session = await auth()
  const { data: plants } = await api.plant.getAll.useQuery({
    limit: 100,
  })

  const columns: ColumnDef<Plant>[] = [
    {
      header: 'Code',
      accessorFn: (row) => row.code,
    },
    {
      header: 'Status',
      accessorFn: (row) => row.status,
    },
    {
      header: 'Source',
      accessorFn: (row) => row.source,
    },
    {
      header: 'Destroy Reason',
      accessorFn: (row) => row.destroyReason ?? 'N/A',
    },
  ]

  if (!session) {
    redirect('/')
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Plants</h2>
        {/* <BaseSheet
          mode="create"
          title="Create Plant"
          description="Create a new plant"
        >
          <PlantForm mode="create" />
        </BaseSheet> */}
      </div>
      <div className="h-full">
        <PlantErrorBoundary>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <DataTable columns={columns} data={plants?.items ?? []} />
          </Suspense>
        </PlantErrorBoundary>
      </div>
    </div>
  )
}
