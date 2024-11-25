'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type tasks } from '~/server/db/schema'
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

// Define the type including relations
type TaskWithRelations = typeof tasks.$inferSelect & {
  assignedTo?: {
    id: string
    name: string
  } | null
  createdBy: {
    id: string
    name: string
  }
}

export const columns: ColumnDef<TaskWithRelations>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const task = row.original
      return (
        <Link
          href={`/tasks/${task.id}`}
          className="font-medium hover:underline"
        >
          {task.title}
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
      const task = row.original
      return task.assignedTo ? (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          {task.assignedTo.name}
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
    accessorKey: 'taskStatus',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('taskStatus') as string
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
      const task = row.original
      const utils = api.useUtils()
      const { toast } = useToast()

      const { mutate: deleteTask } = api.task.delete.useMutation({
        onSuccess: () => {
          toast({ title: 'Task deleted successfully' })
          void utils.task.getAll.invalidate()
        },
        onError: (error) => {
          toast({
            title: 'Error deleting task',
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
              <Link href={`/tasks/${task.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (
                  window.confirm('Are you sure you want to delete this task?')
                ) {
                  deleteTask(task.id)
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