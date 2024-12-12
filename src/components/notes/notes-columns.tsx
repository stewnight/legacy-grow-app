'use client'

import { type ColumnDef, type Table } from '@tanstack/react-table'
import { type NoteWithRelations } from '~/server/db/schema'
import { DataTableColumnHeader } from '~/components/ui/data-table-column-header'
import { DataTableFacetedFilter } from '~/components/ui/data-table-faceted-filter'
import { Badge } from '~/components/ui/badge'
import { format, formatDistanceToNow } from 'date-fns'
import { AppSheet } from '~/components/Layout/app-sheet'
import { NoteForm } from './notes-form'
import { Button } from '~/components/ui/button'
import {
  CalendarIcon,
  Columns2,
  User,
  Clock,
  Tag,
  Box,
  PencilIcon,
  EyeIcon,
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

interface NotesTableFiltersProps {
  table?: Table<NoteWithRelations>
}

export function NotesTableFilters({ table }: NotesTableFiltersProps) {
  if (!table) return null
}

export const columns: ColumnDef<NoteWithRelations>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const note = row.original
      return (
        <Link
          href={`/notes/${note.id}`}
          className="text-nowrap font-medium hover:underline"
        >
          {note.title}
        </Link>
      )
    },
  },
  {
    accessorKey: 'content',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Content" />
    ),
    cell: ({ row }) => {
      const note = row.original
      return <div className="line-clamp-2">{note.content}</div>
    },
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created By" />
    ),
    cell: ({ row }) => {
      const note = row.original
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={note.createdBy.image} alt={note.createdBy.name} />
            <AvatarFallback>
              {note.createdBy.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{note.createdBy.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
  },
]
