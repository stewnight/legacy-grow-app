'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type JobWithRelations } from '~/server/db/schema/jobs'
import { Badge } from '~/components/ui/badge'
import {
  MoreHorizontal,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Tag,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import Link from 'next/link'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'
import { format } from 'date-fns'

export const columns: ColumnDef<JobWithRelations>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const job = row.original
      return (
        <Link
          href={`/jobs/${job.id}`}
          className="font-medium hover:underline text-nowrap"
        >
          {job.title}
        </Link>
      )
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.getValue('category') as string
      return <Badge variant="outline">{category}</Badge>
    },
  },
  {
    accessorKey: 'entityType',
    header: 'Entity Type',
    cell: ({ row }) => {
      const entityType = row.getValue('entityType') as string
      return <Badge variant="outline">{entityType}</Badge>
    },
  },
  {
    accessorKey: 'entityId',
    header: 'Entity ID',
    cell: ({ row }) => {
      const entityId = row.getValue('entityId') as string
      const entityType = row.getValue('entityType') as string
      return (
        <Link href={`/${entityType}s/${entityId}`} className="hover:underline">
          {entityId}
        </Link>
      )
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string
      return (
        <Badge
          variant={
            priority === 'high'
              ? 'destructive'
              : priority === 'medium'
                ? 'default'
                : 'secondary'
          }
        >
          {priority}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
    cell: ({ row }) => {
      const job = row.original
      return job.assignedTo ? (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          {job.assignedTo.name}
        </div>
      ) : (
        'Unassigned'
      )
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => {
      const date = row.getValue('dueDate')
      if (!date) return null
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {format(new Date(date as string), 'PP')}
        </div>
      )
    },
  },
  {
    accessorKey: 'jobStatus',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('jobStatus') as string
      return (
        <div className="flex items-center gap-2">
          {status === 'completed' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : status === 'pending' ? (
            <Clock className="h-4 w-4 text-yellow-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-blue-500" />
          )}
          <Badge
            variant={
              status === 'completed'
                ? 'default'
                : status === 'pending'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {status}
          </Badge>
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const job = row.original
      const utils = api.useUtils()
      const { toast } = useToast()

      const { mutate: deleteJob } = api.job.delete.useMutation({
        onSuccess: () => {
          toast({ title: 'Job deleted successfully' })
          void utils.job.getAll.invalidate()
        },
        onError: (error) => {
          toast({
            title: 'Error deleting job',
            description: error.message,
            variant: 'destructive',
          })
        },
      })

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
            <DropdownMenuItem asChild>
              <Link href={`/jobs/${job.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (
                  window.confirm('Are you sure you want to delete this job?')
                ) {
                  deleteJob(job.id)
                }
              }}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
