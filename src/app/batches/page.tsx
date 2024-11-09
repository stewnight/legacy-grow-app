import { Suspense } from 'react'
import { CreateBatchSheet } from './_components/create-batch-sheet'
import { BatchList } from './_components/batch-list'
import { Skeleton } from '~/components/ui/skeleton'

export default function BatchesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Batches</h2>
        <CreateBatchSheet />
      </div>
      <div className="h-full">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <BatchList />
        </Suspense>
      </div>
    </div>
  )
}
