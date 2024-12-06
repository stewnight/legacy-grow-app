'use client'

import { type ColumnDef, type Table } from '@tanstack/react-table'
import { type JobWithRelations } from '~/server/db/schema'
import { DataTableColumnHeader } from '~/components/ui/data-table-column-header'
import { DataTableFacetedFilter } from '~/components/ui/data-table-faceted-filter'
import { Badge } from '~/components/ui/badge'
import { format, formatDistanceToNow } from 'date-fns'
import { AppSheet } from '~/components/layout/app-sheet'
import { JobForm } from './jobs-form'
import { Button } from '~/components/ui/button'
import { CalendarIcon, Columns2, User, Clock, Tag, Box, PencilIcon, EyeIcon } from 'lucide-react'
import { Calendar } from '~/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import {
  jobCategoryEnum,
  jobPriorityEnum,
  jobStatusEnum,
  type JobPriority,
  type JobStatus,
} from '~/server/db/schema/enums'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import React from 'react'
import Link from 'next/link'
import { cn } from '~/lib/utils'

const priorities = jobPriorityEnum.enumValues.map((value) => ({
  label: value.charAt(0).toUpperCase() + value.slice(1),
  value,
}))

const statuses = jobStatusEnum.enumValues.map((value) => ({
  label: value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' '),
  value,
}))

const categories = jobCategoryEnum.enumValues.map((value) => ({
  label: value.charAt(0).toUpperCase() + value.slice(1),
  value,
}))

export const columns: ColumnDef<JobWithRelations>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      return (
        <Link href={`/jobs/${row.original.id}`}>
          <span className="text-nowrap underline-offset-4 hover:underline">
            {row.original.title}
          </span>
        </Link>
      )
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
    cell: ({ row }) => {
      const priority = row.getValue('priority') as JobPriority
      return (
        <Badge variant={priority as 'default'}>
          <span className="text-nowrap capitalize">{priority}</span>
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'jobStatus',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('jobStatus') as JobStatus
      return (
        <Badge variant={status.toLowerCase() as 'default'}>
          <span className="text-nowrap capitalize">{status.toLowerCase().replace('_', ' ')}</span>
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Due Date" />,
    cell: ({ row }) => {
      const date = row.getValue('dueDate') as Date
      return date ? (
        <span className="text-nowrap">{formatDistanceToNow(date, { addSuffix: true })}</span>
      ) : (
        '-'
      )
    },
    filterFn: (row, id, value: Date) => {
      const rowDate = row.getValue(id) as Date
      if (!rowDate) return false
      return rowDate.toDateString() === value.toDateString()
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'assignedTo',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned To" />,
    cell: ({ row }) => {
      const assignedTo = row.getValue('assignedTo') as {
        id: string
        name: string
        image: string | null
      } | null
      if (!assignedTo) return '-'
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={assignedTo.image ?? ''} alt={assignedTo.name} />
            <AvatarFallback>{assignedTo.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span>{assignedTo.name}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const assignedTo = row.getValue(id) as { id: string } | null
      if (!assignedTo) return value.includes('unassigned')
      return value.includes(assignedTo.id)
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => {
      const category = row.getValue('category') as string
      return <Badge variant="outline">{category}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'entityType',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Entity Type" />,
    cell: ({ row }) => {
      const entityType = row.getValue('entityType') as string
      return entityType === 'none' ? '-' : <Badge variant="outline">{entityType}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'properties',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Est. Duration" />,
    cell: ({ row }) => {
      const properties = row.getValue('properties') as
        | { tasks?: Array<{ estimatedMinutes: number | null }> }
        | undefined
      const totalMinutes =
        properties?.tasks?.reduce((acc, task) => acc + (task.estimatedMinutes || 0), 0) || 0
      return totalMinutes ? `${totalMinutes} mins` : '-'
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/jobs/${row.original.id}`}>
              <EyeIcon className="h-3 w-3" />
            </Link>
          </Button>
          <AppSheet
            mode="edit"
            entity="job"
            trigger={
              <Button variant="ghost" size="icon">
                <PencilIcon className="h-3 w-3" />
              </Button>
            }
          >
            <JobForm mode="edit" defaultValues={row.original} />
          </AppSheet>
        </div>
      )
    },
  },
]

interface JobsTableFiltersProps {
  table?: Table<JobWithRelations>
}

export function JobsTableFilters({ table }: JobsTableFiltersProps) {
  if (!table) return null

  const dueDate = table.getColumn('dueDate')?.getFilterValue() as Date | undefined

  // Get unique assigned users for the filter
  const assignedUsers = React.useMemo(() => {
    const users = new Map<string, { id: string; name: string; image: string | null }>()
    table.getFilteredRowModel().rows.forEach((row) => {
      const assignedTo = row.getValue('assignedTo') as {
        id: string
        name: string
        image: string | null
      } | null
      if (assignedTo) {
        users.set(assignedTo.id, assignedTo)
      }
    })
    return Array.from(users.values()).map((user) => ({
      label: user.name,
      value: user.id,
      icon: () => (
        <Avatar className="h-4 w-4">
          <AvatarImage src={user.image ?? ''} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      ),
    }))
  }, [table])

  return (
    <div className="flex max-w-full flex-1 items-center space-x-2 overflow-x-auto">
      <DataTableFacetedFilter
        column={table.getColumn('priority')}
        title="Priority"
        options={priorities}
      />
      <DataTableFacetedFilter
        column={table.getColumn('jobStatus')}
        title="Status"
        options={statuses}
      />
      <DataTableFacetedFilter
        column={table.getColumn('category')}
        title="Category"
        options={categories}
      />
      <DataTableFacetedFilter
        column={table.getColumn('assignedTo')}
        title="Assigned To"
        options={[
          {
            label: 'Unassigned',
            value: 'unassigned',
            icon: User,
          },
          ...assignedUsers,
        ]}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 border-dashed',
              dueDate && 'border-solid bg-accent text-accent-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dueDate ? format(dueDate, 'PP') : 'Due Date'}
            {dueDate && (
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  table.getColumn('dueDate')?.setFilterValue(undefined)
                }}
                className="ml-2 inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm hover:bg-accent-foreground/10"
              >
                ×
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            numberOfMonths={1}
            onSelect={(date) => {
              table.getColumn('dueDate')?.setFilterValue(date)
            }}
            selected={dueDate}
          />
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <Columns2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
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
