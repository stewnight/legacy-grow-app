import { Suspense } from 'react'
import { Skeleton } from '~/components/ui/skeleton'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { DataTable } from '~/components/ui/data-table'
import { columns } from '../../../components/locations/locations-columns'
import { api } from '~/trpc/server'
import { AppSheet } from '~/components/layout/app-sheet'
import { LocationForm } from '../../../components/locations/locations-form'

export default async function LocationsPage() {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  const { items: locations } = await api.location.getAll({
    limit: 100,
  })

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Locations</h2>
        <AppSheet mode="create" entity="location">
          <LocationForm mode="create" />
        </AppSheet>
      </div>
      <div className="h-full">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <DataTable columns={columns} data={locations} filterColumn="name" />
        </Suspense>
      </div>
    </div>
  )
}
