'use client'

import { useEntity } from '~/hooks/use-entity'
import { type Plant } from '~/server/db/schema/cultivation'
import { columns } from './columns'
import { DataTable } from '~/components/ui/data-table'
import { Card } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { api } from '~/trpc/react'

export function PlantList() {
  const { data: plants, isLoading } = api.plant.getAll.useQuery({
    limit: 100,
  })

  if (isLoading) return <PlantListLoading />

  if (!plants?.items.length) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          No plants found. Create your first plant to get started.
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={plants.items} filterColumn="code" />
}

export function PlantListLoading() {
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
