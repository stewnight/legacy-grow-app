import { auth } from '../../server/auth'
import { api } from '../../trpc/server'
import { BaseSheet } from '../../components/base-sheet'
import { FacilitiesForm } from './_components/facilities-form'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { DataTable } from '../../components/ui/data-table'
import { columns } from './_components/facilities-columns'
import { Skeleton } from '../../components/ui/skeleton'

export default async function FacilitiesPage() {
  const session = await auth()
  const facilities = api.facility.getAll({
    limit: 100,
  })

  if (!session) {
    redirect('/')
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Facilities</h2>
        <BaseSheet mode="create" entity="facility">
          <FacilitiesForm mode="create" />
        </BaseSheet>
      </div>
      <div className="h-full">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <DataTable
            columns={columns}
            data={facilities.then((data) => data.items)}
          />
        </Suspense>
      </div>
    </div>
  )
}
