'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type rooms } from '~/server/db/schema'
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
import { useRouter } from 'next/navigation'

export const columns: ColumnDef<typeof rooms.$inferSelect>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const room = row.original
      return (
        <Link
          href={`/rooms/${room.id}`}
          className="font-medium hover:underline"
        >
          {room.name}
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
    accessorKey: 'capacity',
    header: 'Capacity',
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
      const room = row.original
      const router = useRouter()
      const utils = api.useUtils()
      const { toast } = useToast()

      const { mutate: deleteRoom } = api.room.delete.useMutation({
        onSuccess: () => {
          toast({ title: 'Room deleted successfully' })
          void utils.room.getAll.invalidate()
          router.refresh()
        },
        onError: (error) => {
          toast({
            title: 'Error deleting room',
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
              <Link href={`/rooms/${room.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (
                  window.confirm('Are you sure you want to delete this room?')
                ) {
                  deleteRoom(room.id)
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
