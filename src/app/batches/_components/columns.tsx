'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type BatchWithRelations } from '~/lib/validations/batch'
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

export const columns: ColumnDef<BatchWithRelations>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const batch = row.original
      return (
        <Link
          href={`/batches/${batch.code}`}
          className="font-medium hover:underline"
        >
          {batch.name}
        </Link>
      )
    },
  },
  {
    accessorKey: 'genetic',
    header: 'Genetic',
    cell: ({ row }) => {
      const genetic = row.original.genetic
      return genetic ? (
        <Link href={`/genetics/${genetic.slug}`} className="hover:underline">
          {genetic.name}
        </Link>
      ) : (
        'N/A'
      )
    },
  },
  {
    accessorKey: 'plantCount',
    header: 'Plants',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('status')}</Badge>
    },
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
              <Link href={`/batches/${batch.code}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/batches/${batch.code}/plants`}>View Plants</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
