import { Suspense } from 'react'
import { Skeleton } from '~/components/ui/skeleton'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { DataTable } from '~/components/ui/data-table'
import { columns } from './_components/areas-columns'
import { api } from '~/trpc/server'
import { AppSheet } from '~/components/layout/app-sheet'
import { AreaForm } from './_components/areas-form'

export default async function AreasPage() {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  const { items: areas } = await api.area.getAll({
    limit: 100,
    filters: {
      status: 'active',
    },
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Areas</h2>
        <AppSheet mode="create" entity="area">
          <AreaForm mode="create" />
        </AppSheet>
      </div>
      <div className="h-full">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <DataTable columns={columns} data={areas} filterColumn="name" />
        </Suspense>
      </div>
    </div>
  )
}
