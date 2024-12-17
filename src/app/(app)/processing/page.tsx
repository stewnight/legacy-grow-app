import { Suspense } from 'react'
import { Skeleton } from '~/components/ui/skeleton'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { DataTable } from '~/components/ui/data-table'
import {
  columns,
  ProcessingTableFilters,
} from '~/components/processing/processing-columns'
import { api } from '~/trpc/server'
import { AppSheet } from '~/components/layout/app-sheet'
import { ProcessingForm } from '~/components/processing/processing-form'
import { ProcessingDashboard } from '~/components/processing/processing-dashboard'

export default async function ProcessingPage() {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  const { items: processingData } = await api.processing.getAll({
    limit: 100,
  })

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Processing</h2>
        <AppSheet mode="create" entity="processing">
          <ProcessingForm mode="create" />
        </AppSheet>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-[150px]" />
          </div>
        }
      >
        <ProcessingDashboard processing={processingData} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={processingData}
            enableFiltering
            enableColumnFilters
            filters={<ProcessingTableFilters />}
          />
        </div>
      </Suspense>
    </div>
  )
}
