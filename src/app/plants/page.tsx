import { Suspense } from 'react'
import { Skeleton } from '~/components/ui/skeleton'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { api } from '~/trpc/react'
import { DataTable } from '~/components/ui/data-table'
import { columns } from './_components/plant-columns'

export default async function PlantsPage() {
  const session = await auth()
  const { data: plants } = api.plant.getAll.useQuery({
    limit: 100,
  })

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
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <DataTable columns={columns} data={plants?.items ?? []} />
        </Suspense>
      </div>
    </div>
  )
}
