'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type Plant } from '~/server/db/schemas/cultivation'
import { Badge } from '~/components/ui/badge'
import { format, formatDistanceToNow } from 'date-fns'
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

export const columns: ColumnDef<Plant>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => {
      return (
        <Link
          className="hover:underline whitespace-nowrap"
          href={`/plants/${row.original.code}`}
        >
          {row.original.code}
        </Link>
      )
    },
  },
  {
    accessorKey: 'batchId',
    header: 'Batch',
    cell: ({ row }) => {
      return (
        <Link
          className="hover:underline whitespace-nowrap"
          href={`/batches/${row.original.batchId}`}
        >
          {row.original.batchId}
        </Link>
      )
    },
  },

  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('source')}</Badge>
    },
  },
  {
    accessorKey: 'stage',
    header: 'Stage',
    cell: ({ row }) => {
      return <Badge>{row.getValue('stage')}</Badge>
    },
  },
  {
    accessorKey: 'healthStatus',
    header: 'Health',
    cell: ({ row }) => {
      const status = row.getValue('healthStatus') as string
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
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'plantDate',
    header: 'Plant Date',
    cell: ({ row }) => {
      const date = row.getValue('plantDate')
      return (
        <span
          className="whitespace-nowrap"
          title={date ? format(new Date(date as string), 'PPP') : undefined}
        >
          {date
            ? formatDistanceToNow(new Date(date as string), { addSuffix: true })
            : 'N/A'}
        </span>
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
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/plants/${plant.id}`}>View Details</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
