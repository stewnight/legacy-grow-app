'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type facilities } from '~/server/db/schema'
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

export const columns: ColumnDef<typeof facilities.$inferSelect>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const facility = row.original
      return (
        <Link
          href={`/facilities/${facility.id}`}
          className="font-medium hover:underline"
        >
          {facility.name}
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
      const facility = row.original
      return (
        <Link href={`/facilities/${facility.id}`} className="hover:underline">
          {facility.name}
        </Link>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const facility = row.original
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
              <Link href={`/facilities/${facility.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/facilities/${facility.id}/batches`}>
                View Batches
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
