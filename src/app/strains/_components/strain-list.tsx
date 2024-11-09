'use client'

import { api } from '~/trpc/react'
import { columns } from './columns'
import { DataTable } from '~/components/ui/data-table'

export function StrainList() {
  const { data: strains, isLoading } = api.strain.list.useQuery()

  if (isLoading) {
    return null // Parent handles loading state
  }

  if (!strains?.length) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          No strains found. Create your first strain to get started.
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={strains} filterColumn="name" />
}
