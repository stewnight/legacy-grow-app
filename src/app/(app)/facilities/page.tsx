import { Suspense } from 'react'
import { Skeleton } from '~/components/ui/skeleton'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { DataTable } from '~/components/ui/data-table'
import { api } from '~/trpc/server'
import { AppSheet } from '~/components/layout/app-sheet'
import { FacilitiesForm } from './_components/facilities-form'
import { columns } from './_components/facilities-columns'

export default async function FacilitiesPage() {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  const { items: facilities } = await api.facility.getAll({
    limit: 100,
    filters: {
      status: 'active',
    },
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Facilities</h2>
        <AppSheet mode="create" entity="facility">
          <FacilitiesForm mode="create" />
        </AppSheet>
      </div>
      <div className="h-full">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <DataTable columns={columns} data={facilities} filterColumn="name" />
        </Suspense>
      </div>
    </div>
  )
}
