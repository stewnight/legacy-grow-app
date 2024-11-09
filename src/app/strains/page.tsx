import { Suspense } from 'react'
import { CreateStrainSheet } from './_components/create-strain-sheet'
import { StrainList } from './_components/strain-list'
import { Skeleton } from '~/components/ui/skeleton'

export default function StrainsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Strains</h2>
        <CreateStrainSheet />
      </div>
      <div className="h-full">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <StrainList />
        </Suspense>
      </div>
    </div>
  )
}
