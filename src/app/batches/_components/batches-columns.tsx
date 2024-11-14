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

export const columns: ColumnDef<typeof batches.$inferSelect>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const batch = row.original
      return (
        <Link
          href={`/batches/${batch.id}`}
          className="font-medium hover:underline"
        >
          {batch.name}
        </Link>
      )
    },
  },
  {
    accessorKey: 'code',
    header: 'Code',
  },
  {
    accessorKey: 'genetic',
    header: 'Genetic',
    cell: ({ row }) => {
      const geneticId = row.original.geneticId
      const genetic = geneticId ? api.genetic.get.useQuery(geneticId) : null
      return genetic?.data ? (
        <Link
          href={`/genetics/${genetic.data.slug}`}
          className="hover:underline"
        >
          {genetic.data.name}
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
    accessorKey: 'stage',
    header: 'Stage',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('stage')}</Badge>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('status')}</Badge>
    },
  },
  {
    accessorKey: 'healthStatus',
    header: 'Health',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('healthStatus')}</Badge>
    },
  },
  {
    accessorKey: 'plantDate',
    header: 'Plant Date',
    cell: ({ row }) => {
      const date = row.getValue('plantDate')
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
              <Link href={`/batches/${batch.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/batches/${batch.id}/plants`}>View Plants</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
