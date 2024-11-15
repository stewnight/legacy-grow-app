'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type batches } from '~/server/db/schema'
import { Badge } from '~/components/ui/badge'
import { format } from 'date-fns'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import Link from 'next/link'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'

export const columns: ColumnDef<typeof batches.$inferSelect>[] = [
  {
    accessorKey: 'identifier',
    header: 'Identifier',
    cell: ({ row }) => {
      const batch = row.original
      return (
        <Link
          href={`/batches/${batch.id}`}
          className="font-medium hover:underline"
        >
          {batch.identifier}
        </Link>
      )
    },
  },
  {
    accessorKey: 'stage',
    header: 'Stage',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('stage')}</Badge>
    },
  },
  {
    accessorKey: 'batchStatus',
    header: 'Status',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('batchStatus')}</Badge>
    },
  },
  {
    accessorKey: 'plantCount',
    header: 'Plants',
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }) => {
      const date = row.getValue('startDate')
      return date ? format(new Date(date as string), 'PPP') : 'N/A'
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const batch = row.original
      const utils = api.useUtils()
      const { toast } = useToast()

      const { mutate: deleteBatch } = api.batch.delete.useMutation({
        onSuccess: () => {
          toast({ title: 'Batch deleted successfully' })
          void utils.batch.getAll.invalidate()
        },
        onError: (error) => {
          toast({
            title: 'Error deleting batch',
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
              <Link href={`/batches/${batch.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (
                  window.confirm('Are you sure you want to delete this batch?')
                ) {
                  deleteBatch(batch.id)
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
