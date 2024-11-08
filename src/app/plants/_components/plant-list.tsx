'use client'

import { api } from '~/trpc/react'
import { columns } from './columns'
import { DataTable } from '~/components/ui/data-table'
import { Skeleton } from '~/components/ui/skeleton'

export function PlantList() {
  const { data: plants, isLoading } = api.plant.list.useQuery()

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (!plants?.length) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">No plants found</p>
      </div>
    )
  }

  return <DataTable columns={columns} data={plants} />
}
