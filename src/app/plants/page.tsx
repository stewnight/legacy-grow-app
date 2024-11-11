import { Suspense } from 'react'
import { PlantSheet } from './_components/plant-sheet'
import { PlantList } from './_components/plant-list'
import { Skeleton } from '~/components/ui/skeleton'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { PlantErrorBoundary } from './_components/plant-error-boundary'

export default async function PlantsPage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Plants</h2>
        <PlantSheet mode="create" />
      </div>
      <div className="h-full">
        <PlantErrorBoundary>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <PlantList />
          </Suspense>
        </PlantErrorBoundary>
      </div>
    </div>
  )
}
