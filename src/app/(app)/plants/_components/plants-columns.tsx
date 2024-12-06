'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { Plant, type plants } from '~/server/db/schema'
import { Badge } from '~/components/ui/badge'
import { MoreHorizontal, Leaf, MapPin, Calendar, Activity } from 'lucide-react'
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
import { AppSheet } from '../../../../components/layout/app-sheet'
import { PlantForm } from './plants-form'

// Define the type including relations
type PlantWithRelations = typeof plants.$inferSelect & {
  genetic?: {
    id: string
    name: string
  } | null
  location?: {
    id: string
    name: string
  } | null
  batch?: {
    id: string
    identifier: string
  } | null
  mother?: {
    id: string
    identifier: string
  } | null
}

export const columns: ColumnDef<PlantWithRelations>[] = [
  {
    accessorKey: 'identifier',
    header: 'Identifier',
    cell: ({ row }) => {
      const plant = row.original
      return (
        <Link
          href={`/plants/${plant.id}`}
          className="font-medium hover:underline"
        >
          {plant.identifier}
        </Link>
      )
    },
  },
  {
    accessorKey: 'genetic',
    header: 'Genetic',
    cell: ({ row }) => {
      const plant = row.original
      return plant.genetic ? (
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-muted-foreground" />
          <Link
            href={`/genetics/${plant.genetic.id}`}
            className="hover:underline"
          >
            {plant.genetic.name}
          </Link>
        </div>
      ) : (
        'N/A'
      )
    },
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => {
      const plant = row.original
      return plant.location ? (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <Link
            href={`/locations/${plant.location.id}`}
            className="hover:underline"
          >
            {plant.location.name}
          </Link>
        </div>
      ) : (
        'N/A'
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
    accessorKey: 'health',
    header: 'Health',
    cell: ({ row }) => {
      const health = row.getValue('health') as string
      return (
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <Badge
            variant={
              health === 'healthy'
                ? 'default'
                : health === 'sick' || health === 'pest'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {health}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'plantedDate',
    header: 'Planted Date',
    cell: ({ row }) => {
      const date = row.getValue('plantedDate')
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
    accessorKey: 'batch',
    header: 'Batch',
    cell: ({ row }) => {
      const plant = row.original
      return plant.batch ? (
        <Link href={`/batches/${plant.batch.id}`} className="hover:underline">
          {plant.batch.identifier}
        </Link>
      ) : (
        'N/A'
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const plant = row.original
      const utils = api.useUtils()
      const { toast } = useToast()

      const { mutate: deletePlant } = api.plant.delete.useMutation({
        onSuccess: () => {
          toast({ title: 'Plant deleted successfully' })
          void utils.plant.getAll.invalidate()
        },
        onError: (error) => {
          toast({
            title: 'Error deleting plant',
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
              <Link href={`/plants/${plant.id}`}>View Details</Link>
            </DropdownMenuItem>
            <AppSheet mode="edit">
              <PlantForm mode="edit" defaultValues={plant as Plant} />
            </AppSheet>
            <DropdownMenuItem
              onClick={() => {
                if (
                  window.confirm('Are you sure you want to delete this plant?')
                ) {
                  deletePlant(plant.id)
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
