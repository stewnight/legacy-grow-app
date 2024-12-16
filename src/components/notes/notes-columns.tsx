'use client'

import { type ColumnDef, type Table } from '@tanstack/react-table'
import { type NoteWithRelations } from '~/server/db/schema'
import { DataTableColumnHeader } from '~/components/ui/data-table-column-header'
import { DataTableFacetedFilter } from '~/components/ui/data-table-faceted-filter'
import { Badge } from '~/components/ui/badge'
import { format } from 'date-fns'
import { AppSheet } from '~/components/layout/app-sheet'
import { NoteForm } from './notes-form'
import { Button } from '~/components/ui/button'
import {
  CalendarIcon,
  CheckSquare,
  FileText,
  Image,
  Tag,
  Mic,
  File,
  Link as LinkIcon,
  Columns2,
  Ruler,
  EyeIcon,
  PencilIcon,
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { noteTypeEnum } from '~/server/db/schema/enums'
import React from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

interface NotesTableFiltersProps {
  table: Table<NoteWithRelations>
}

export function NotesTableFilters({ table }: NotesTableFiltersProps) {
  if (!table) return null

  // Get unique entity types for the filter
  const entityTypes = React.useMemo(() => {
    const types = new Set<string>()
    table.getFilteredRowModel().rows.forEach((row) => {
      const entityType = row.getValue('entityType')
      if (entityType && entityType !== 'none') {
        types.add(entityType as string)
      }
    })
    return Array.from(types).map((type) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: type,
    }))
  }, [table])

  // Get tags for the filter - Fixed to handle multiple tags
  const tags = React.useMemo(() => {
    const tagsSet = new Set<string>()
    table.getFilteredRowModel().rows.forEach((row) => {
      const noteTags = row.original.properties?.tags
      if (noteTags && Array.isArray(noteTags)) {
        noteTags.forEach((tag) => tagsSet.add(tag))
      }
    })
    return Array.from(tagsSet).map((tag) => ({
      label: tag,
      value: tag,
      icon: () => <Tag className="h-4 w-4" />,
    }))
  }, [table])

  // Get unique users for the filter
  const users = React.useMemo(() => {
    const usersMap = new Map<
      string,
      { id: string; name: string; image: string | null }
    >()
    table.getFilteredRowModel().rows.forEach((row) => {
      const createdBy = row.original.createdBy
      if (createdBy) {
        usersMap.set(createdBy.id, createdBy)
      }
    })
    return Array.from(usersMap.values()).map((user) => ({
      label: user.name,
      value: user.id,
      icon: () => (
        <Avatar className="h-4 w-4">
          <AvatarImage src={user.image ?? ''} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      ),
    }))
  }, [table])

  return (
    <div className="flex max-w-full flex-1 items-center space-x-2 overflow-x-auto">
      <DataTableFacetedFilter
        column={table.getColumn('type')}
        title="Type"
        options={noteTypeEnum.enumValues.map((type) => ({
          label: type.charAt(0).toUpperCase() + type.slice(1),
          value: type,
          icon:
            type === 'text'
              ? FileText
              : type === 'checklist'
                ? CheckSquare
                : Image,
        }))}
      />
      {entityTypes.length > 0 && (
        <DataTableFacetedFilter
          column={table.getColumn('entityType')}
          title="Related To"
          options={[{ label: 'None', value: 'none' }, ...entityTypes]}
        />
      )}

      {tags.length > 0 && (
        <DataTableFacetedFilter
          column={table.getColumn('tags')}
          title="Tags"
          options={tags}
        />
      )}

      <DataTableFacetedFilter
        column={table.getColumn('createdBy')}
        title="Created By"
        options={users}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <Columns2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' && column.getCanHide()
            )
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              )
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const columns: ColumnDef<NoteWithRelations>[] = [
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const note = row.original
      const icon = {
        text: <FileText className="h-4 w-4" />,
        checklist: <CheckSquare className="h-4 w-4" />,
        media: <Image className="h-4 w-4" />,
        measurement: <Ruler className="h-4 w-4" />,
        voice: <Mic className="h-4 w-4" />,
        image: <Image className="h-4 w-4" />,
        file: <File className="h-4 w-4" />,
        link: <LinkIcon className="h-4 w-4" />,
      }[note.type]

      return (
        <div className="flex items-center gap-2 text-nowrap">
          {icon}
          <span className="capitalize">{note.type}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableColumnFilter: true,
  },
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
          className="font-medium hover:underline text-nowrap"
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
    enableColumnFilter: true,
  },
  {
    id: 'tags',
    accessorFn: (row) => row.properties?.tags,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    cell: ({ row }) => {
      const tags = row.original.properties?.tags
      if (!tags?.length) return null
      return (
        <div className="flex flex-wrap gap-1 text-nowrap">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>
      )
    },
    filterFn: (row, id, value: string[]) => {
      const tags = row.original.properties?.tags
      if (!tags) return false
      return value.some((filterValue) => tags.includes(filterValue))
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'entityType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Related To" />
    ),
    cell: ({ row }) => {
      const note = row.original
      if (note.entityType === 'none' || !note.entityId) return null
      return (
        <Link
          href={`/${note.entityType}s/${note.entityId}`}
          className="flex items-center gap-1 hover:underline text-nowrap"
        >
          <LinkIcon className="h-3 w-3" />
          <span className="capitalize">{note.entityType}</span>
        </Link>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created By" />
    ),
    cell: ({ row }) => {
      const note = row.original
      return (
        <div className="flex items-center gap-2 text-nowrap">
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
    filterFn: (row, id, value) => {
      return value.includes(row.original.createdBy.id)
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 text-nowrap">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{format(row.original.createdAt, 'PPp')}</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/notes/${row.original.id}`}>
              <EyeIcon className="h-3 w-3" />
            </Link>
          </Button>
          <AppSheet
            mode="edit"
            entity="note"
            trigger={
              <Button variant="ghost" size="icon">
                <PencilIcon className="h-3 w-3" />
              </Button>
            }
          >
            <NoteForm mode="edit" initialData={row.original} />
          </AppSheet>
        </div>
      )
    },
  },
]
