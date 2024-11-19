'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type genetics } from '~/server/db/schema'
import { Badge } from '~/components/ui/badge'
import { MoreHorizontal, Dna, Sprout, Timer } from 'lucide-react'
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
    accessorKey: 'properties',
    header: 'Properties',
    cell: ({ row }) => {
      const genetic = row.original
      const props = genetic.properties
      return (
        <div className="flex gap-2">
          {props?.thc && (
            <div
              className="flex items-center gap-1 text-sm"
              title={`THC: ${props.thc.min}% - ${props.thc.max}%`}
            >
              <Dna className="h-4 w-4" />
            </div>
          )}
          {props?.effects && props.effects.length > 0 && (
            <div
              className="flex items-center gap-1 text-sm"
              title={`Effects: ${props.effects.join(', ')}`}
            >
              <Sprout className="h-4 w-4" />
            </div>
          )}
          {genetic.growProperties?.floweringTime && (
            <div
              className="flex items-center gap-1 text-sm"
              title={`Flowering: ${genetic.growProperties.floweringTime.min}-${genetic.growProperties.floweringTime.max} ${genetic.growProperties.floweringTime.unit}`}
            >
              <Timer className="h-4 w-4" />
            </div>
          )}
        </div>
      )
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
