'use client'

import { DataTable } from '~/components/ui/data-table'
import { columns } from './columns'
import { api } from '~/trpc/react'

export function BatchList() {
  const { data: batches, isLoading } = api.batch.list.useQuery()

  if (isLoading) {
    return null // Parent handles loading state
  }

  if (!batches?.length) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          No batches found. Create your first batch to get started.
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={batches} filterColumn="name" />
}
