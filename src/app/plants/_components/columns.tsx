'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '~/components/ui/badge'
import { format } from 'date-fns'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

import type { Plant } from '~/server/db/schemas'

export const columns: ColumnDef<Plant>[] = [
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'batchId',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Batch ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const batchId: Plant['batchId'] = row.getValue('batchId')
      return batchId ? `Batch ${batchId}` : 'N/A'
    },
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('source')}</Badge>
    ),
  },
  {
    accessorKey: 'stage',
    header: ({ column }) => {
      const stages = ['seedling', 'vegetative', 'flowering']
      return (
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Stage
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <Select
            value={(column.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              column.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    },
    cell: ({ row }) => {
      const stage: Plant['stage'] = row.getValue('stage')
      return (
        <Badge
          variant={
            stage === 'flowering'
              ? 'default'
              : stage === 'vegetative'
                ? 'secondary'
                : 'outline'
          }
        >
          {stage}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'plantDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Plant Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date: Plant['plantDate'] = row.getValue('plantDate')
      return date ? format(new Date(date), 'MMM d, yyyy') : 'N/A'
    },
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => {
      const locationId: Plant['locationId'] = row.getValue('locationId')
      return locationId ? `Location ${locationId}` : 'N/A'
    },
  },
  {
    accessorKey: 'healthStatus',
    header: ({ column }) => {
      const statuses = ['healthy', 'sick', 'recovering']
      return (
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Health Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <Select
            value={(column.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              column.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    },
    cell: ({ row }) => {
      const status: Plant['healthStatus'] = row.getValue('healthStatus')
      return (
        <Badge
          variant={
            status === 'healthy'
              ? 'default'
              : status === 'sick'
                ? 'destructive'
                : 'secondary'
          }
        >
          {status ?? 'N/A'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const plant = row.original

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
              onClick={() => navigator.clipboard.writeText(plant.id.toString())}
            >
              Copy plant ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit plant</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
