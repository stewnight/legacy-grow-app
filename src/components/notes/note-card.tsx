'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { type RouterOutputs } from '~/trpc/shared'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '~/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { MoreVertical, Reply, Pencil, Trash2 } from 'lucide-react'
import { cn } from '~/lib/utils'
import Image from 'next/image'

type NoteWithUser = RouterOutputs['notes']['list']['items'][number]

interface NoteCardProps {
  note: NoteWithUser
  onReply?: (noteId: number) => void
  onEdit?: (note: NoteWithUser) => void
  onDelete?: (noteId: number) => void
  className?: string
}

export function NoteCard({
  note,
  onReply,
  onEdit,
  onDelete,
  className,
}: NoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(note.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className={cn('relative', className)}>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={note.createdBy.image ?? undefined} />
          <AvatarFallback>
            {note.createdBy.name?.[0] ?? note.createdBy.email?.[0] ?? '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium leading-none">
                {note.createdBy.name ?? note.createdBy.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(note.createdAt), 'PPp')}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onReply && (
                  <DropdownMenuItem onClick={() => onReply(note.id)}>
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(note)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {note.type === 'image' && note.metadata?.url && (
          <div className="mb-4">
            <Image
              src={note.metadata.url}
              alt="Note attachment"
              width={300}
              height={300}
              className="rounded-md"
            />
          </div>
        )}
        <p className="text-sm">{note.content}</p>
      </CardContent>
      {note.parentId && (
        <CardFooter className="text-xs text-muted-foreground">
          Reply to note #{note.parentId}
        </CardFooter>
      )}
    </Card>
  )
}
