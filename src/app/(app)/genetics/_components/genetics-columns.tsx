'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type genetics } from '~/server/db/schema'
import { Badge } from '~/components/ui/badge'
import { MoreHorizontal } from 'lucide-react'
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
import { AppSheet } from '../../../../components/layout/app-sheet'
import { GeneticForm } from './genetics-form'

export const columns: ColumnDef<typeof genetics.$inferSelect>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const genetic = row.original
      return (
        <Link
          href={`/genetics/${genetic.id}`}
          className="font-medium hover:underline"
        >
          {genetic.name}
        </Link>
      )
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('type')}</Badge>
    },
  },
  {
    accessorKey: 'breeder',
    header: 'Breeder',
  },
  {
    accessorKey: 'inHouse',
    header: 'In House',
    cell: ({ row }) => {
      return row.getValue('inHouse') ? 'Yes' : 'No'
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
    id: 'actions',
    cell: ({ row }) => {
      const genetic = row.original
      const utils = api.useUtils()
      const { toast } = useToast()

      const { mutate: deleteGenetic } = api.genetic.delete.useMutation({
        onSuccess: () => {
          toast({ title: 'Genetic deleted successfully' })
          void utils.genetic.getAll.invalidate()
        },
        onError: (error) => {
          toast({
            title: 'Error deleting genetic',
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
              <Link href={`/genetics/${genetic.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to delete this genetic?'
                  )
                ) {
                  deleteGenetic(genetic.id)
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
