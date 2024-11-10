'use client'

import { DataTable } from '~/components/ui/data-table'
import { columns } from './columns'
import { api } from '~/trpc/react'
import { Card } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'

export function BatchList() {
  const { data: batches, isLoading } = api.batch.list.useQuery()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </Card>
          ))}
      </div>
    )
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
