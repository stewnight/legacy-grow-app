'use client'

import { type Table, type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Columns2, MoreHorizontal } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'
import { AppSheet } from '~/components/Layout/app-sheet'
import { EquipmentForm } from '~/components/equipment/equipment-form'
import { type Equipment } from '~/server/db/schema/equipment'
import { DataTableColumnHeader } from '../ui/data-table-column-header'
import Link from 'next/link'
import { DataTableFacetedFilter } from '../ui/data-table-faceted-filter'
import { equipmentStatusEnum, statusEnum } from '~/server/db/schema/enums'
import { equipmentTypeEnum } from '~/server/db/schema/enums'

// Helper function to safely format dates
const formatDate = (date: Date | string | null) => {
  if (!date) return '-'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'PP')
}
interface EquipmentTableFiltersProps {
  table?: Table<Equipment>
}

export function EquipmentTableFilters({ table }: EquipmentTableFiltersProps) {
  if (!table) return null
  return (
    <div className="flex items-center space-x-2">
      <DataTableFacetedFilter
        column={table.getColumn('status')}
        title="Status"
        options={statusEnum.enumValues.map((value) => ({
          label: value.charAt(0).toUpperCase() + value.slice(1),
          value: value,
        }))}
      />
      <DataTableFacetedFilter
        column={table.getColumn('type')}
        title="Type"
        options={equipmentTypeEnum.enumValues.map((value) => ({
          label: value.charAt(0).toUpperCase() + value.slice(1),
          value: value,
        }))}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <Columns2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' && column.getCanHide()
            )
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              )
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const columns: ColumnDef<Equipment>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const equipment = row.original
      return (
        <Link
          href={`/equipment/${equipment.id}`}
          className="text-nowrap font-medium hover:underline"
        >
          {equipment.name}
        </Link>
      )
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type')
      return type.charAt(0).toUpperCase() + type.slice(1)
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status')
      return (
        <Badge
          variant="outline"
          className={cn(
            status === 'active' && 'border-green-500 text-green-500',
            status === 'maintenance' && 'border-yellow-500 text-yellow-500',
            status === 'offline' && 'border-red-500 text-red-500'
          )}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'purchaseDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Purchase Date" />
    ),
    cell: ({ row }) => formatDate(row.original.purchaseDate),
  },
  {
    accessorKey: 'warrantyExpiration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Warranty Expiration" />
    ),
    cell: ({ row }) => formatDate(row.original.warrantyExpiration),
  },
  {
    accessorKey: 'lastMaintenanceDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Maintenance" />
    ),
    cell: ({ row }) => formatDate(row.original.lastMaintenanceDate),
  },
  {
    accessorKey: 'nextMaintenanceDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Next Maintenance" />
    ),
    cell: ({ row }) => {
      const date = row.original.nextMaintenanceDate
      if (!date) return '-'
      const dateObj = new Date(date)
      const isOverdue = dateObj < new Date()
      return (
        <Badge
          variant="outline"
          className={cn(isOverdue && 'border-red-500 text-red-500')}
        >
          {format(dateObj, 'PP')}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const equipment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault()
                navigator.clipboard.writeText(equipment.id)
              }}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AppSheet
              mode="edit"
              entity="equipment"
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit Equipment
                </DropdownMenuItem>
              }
            >
              <EquipmentForm mode="edit" initialData={equipment} />
            </AppSheet>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
