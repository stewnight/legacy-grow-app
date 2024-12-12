import { Suspense } from 'react'
import { Skeleton } from '~/components/ui/skeleton'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { DataTable } from '~/components/ui/data-table'
import { columns } from '../../../components/batches/batches-columns'
import { api } from '~/trpc/server'
import { AppSheet } from '~/components/Layout/app-sheet'
import { BatchForm } from '../../../components/batches/batches-form'

export default async function BatchesPage() {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  const { items: batches } = await api.batch.getAll({
    limit: 100,
  })

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Batches</h2>
        <AppSheet mode="create" entity="batch">
          <BatchForm mode="create" />
        </AppSheet>
      </div>
      <div className="h-full">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <DataTable
            columns={columns}
            data={batches}
            filterColumn="identifier"
          />
        </Suspense>
      </div>
    </div>
  )
}
