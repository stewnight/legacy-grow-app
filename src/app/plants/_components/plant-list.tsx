'use client'

import { api } from '~/trpc/react'
import { columns } from './columns'
import { DataTable } from '~/components/ui/data-table'

export function PlantList() {
  const { data: plants, isLoading } = api.plant.list.useQuery()

  if (isLoading) {
    return null // Parent handles loading state
  }

  if (!plants?.length) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          No plants found. Create your first plant to get started.
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={plants} filterColumn="code" />
}
