'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type Processing } from '~/server/db/schema'
import { DataTableColumnHeader } from '~/components/ui/data-table-column-header'
import { Badge } from '~/components/ui/badge'
import { format } from 'date-fns'
import { Checkbox } from '~/components/ui/checkbox'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { X } from 'lucide-react'
import { type Table } from '@tanstack/react-table'

export const columns: ColumnDef<Processing>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'identifier',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Identifier" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Link
            href={`/processing/${row.original.id}`}
            className="max-w-[500px] truncate font-medium hover:underline"
          >
            {row.getValue('identifier')}
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          <Badge variant="outline">{row.getValue('type')}</Badge>
        </div>
      )
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
    cell: ({ row }) => row.getValue('method'),
  },
  {
    accessorKey: 'processStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('processStatus') as string
      return (
        <Badge
          variant={
            status === 'active'
              ? 'default'
              : status === 'completed'
                ? 'secondary'
                : 'destructive'
          }
        >
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'startedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Started" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          {format(row.getValue('startedAt'), 'PP')}
        </div>
      )
    },
  },
  {
    accessorKey: 'completedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Completed" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('completedAt')
      return (
        <div className="flex w-[100px] items-center">
          {date ? format(date as Date, 'PP') : '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'inputWeight',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Input Weight" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          {row.getValue('inputWeight')}g
        </div>
      )
    },
  },
  {
    accessorKey: 'outputWeight',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Output Weight" />
    ),
    cell: ({ row }) => {
      const weight = row.getValue('outputWeight')
      return (
        <div className="flex w-[100px] items-center">
          {weight ? `${weight}g` : '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'yieldPercentage',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Yield %" />
    ),
    cell: ({ row }) => {
      const yield_ = row.getValue('yieldPercentage')
      return (
        <div className="flex w-[100px] items-center">
          {yield_ ? `${yield_}%` : '-'}
        </div>
      )
    },
  },
]

interface ProcessingTableFiltersProps {
  table?: Table<Processing>
}

export function ProcessingTableFilters({ table }: ProcessingTableFiltersProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search identifier..."
          value={
            (table?.getColumn('identifier')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table?.getColumn('identifier')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table?.getColumn('type') && (
          <Select
            value={(table?.getColumn('type')?.getFilterValue() as string) ?? ''}
            onValueChange={(value) =>
              table?.getColumn('type')?.setFilterValue(value)
            }
          >
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="drying">Drying</SelectItem>
              <SelectItem value="curing">Curing</SelectItem>
              <SelectItem value="extraction">Extraction</SelectItem>
            </SelectContent>
          </Select>
        )}
        {table?.getColumn('processStatus') && (
          <Select
            value={
              (table?.getColumn('processStatus')?.getFilterValue() as string) ??
              ''
            }
            onValueChange={(value) =>
              table?.getColumn('processStatus')?.setFilterValue(value)
            }
          >
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        )}
        {table?.getColumn('identifier')?.getFilterValue() ||
        table?.getColumn('type')?.getFilterValue() ||
        table?.getColumn('processStatus')?.getFilterValue() ? (
          <Button
            variant="ghost"
            onClick={() => table?.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
