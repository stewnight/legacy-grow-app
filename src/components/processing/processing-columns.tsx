'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type ProcessingWithRelations } from '~/server/db/schema/processing'
import { Badge } from '~/components/ui/badge'
import { DataTableColumnHeader } from '~/components/ui/data-table-column-header'
import { format } from 'date-fns'
import { Button } from '~/components/ui/button'
import { AppSheet } from '~/components/layout/app-sheet'
import { ProcessingForm } from './processing-form'
import { EyeIcon, PencilIcon } from 'lucide-react'
import Link from 'next/link'

export const columns: ColumnDef<ProcessingWithRelations>[] = [
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return <Badge variant="outline">{type}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'method',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Method" />
    ),
    cell: ({ row }) => {
      const method = row.getValue('method') as string
      return <Badge>{method.replace('_', ' ')}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant={status === 'completed' ? 'default' : 'outline'}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'inputWeight',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Input Weight" />
    ),
    cell: ({ row }) => {
      const weight = row.getValue('inputWeight') as number
      return <span>{weight}g</span>
    },
  },
  {
    accessorKey: 'outputWeight',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Output Weight" />
    ),
    cell: ({ row }) => {
      const weight = row.getValue('outputWeight') as number | null
      return weight ? <span>{weight}g</span> : null
    },
  },
  {
    accessorKey: 'yieldPercentage',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Yield %" />
    ),
    cell: ({ row }) => {
      const yield_ = row.getValue('yieldPercentage') as number | null
      return yield_ ? <span>{yield_.toFixed(2)}%</span> : null
    },
  },
  {
    accessorKey: 'startedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Started" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('startedAt') as Date | null
      return date ? <span>{format(date, 'PPp')}</span> : null
    },
  },
  {
    accessorKey: 'completedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Completed" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('completedAt') as Date | null
      return date ? <span>{format(date, 'PPp')}</span> : null
    },
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created By" />
    ),
    cell: ({ row }) => {
      const user = row.original.createdBy
      return user ? <span>{user.name}</span> : null
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/processing/${row.original.id}`}>
              <EyeIcon className="h-3 w-3" />
            </Link>
          </Button>
          <AppSheet
            mode="edit"
            entity="processing"
            trigger={
              <Button variant="ghost" size="icon">
                <PencilIcon className="h-3 w-3" />
              </Button>
            }
          >
            <ProcessingForm mode="edit" />
          </AppSheet>
        </div>
      )
    },
  },
]
