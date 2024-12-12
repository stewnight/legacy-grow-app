'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'
import { format } from 'date-fns'
import { type Note } from '~/server/db/schema/notes'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2 } from 'lucide-react'

interface NotesManagerProps {
  jobId: string
  notes?: Note[]
}

export function NotesManager({
  jobId,
  notes: initialNotes,
}: NotesManagerProps) {
  const [content, setContent] = React.useState('')
  const { toast } = useToast()
  const utils = api.useUtils()

  const { data: notes, isLoading } = api.note.getAllForJob.useQuery(jobId)

  const { mutate: createNote, isPending: isCreating } =
    api.note.create.useMutation({
      onSuccess: () => {
        setContent('')
        toast({ title: 'Note added successfully' })
        void utils.note.getAllForJob.invalidate(jobId)
      },
      onError: (error) => {
        toast({
          title: 'Error adding note',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    createNote({
      content,
      entityId: jobId,
      entityType: 'job',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Add a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <Button type="submit" disabled={isCreating || !content.trim()}>
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Note...
            </>
          ) : (
            'Add Note'
          )}
        </Button>
      </form>

      <div className="space-y-4">
        {notes?.map((note) => (
          <div
            key={note.id}
            className="flex gap-4 rounded-lg border bg-card p-4"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={note.createdBy?.image ?? undefined}
                alt={note.createdBy?.name ?? ''}
              />
              <AvatarFallback>
                {note.createdBy?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{note.createdBy.name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(note.createdAt), 'PPp')}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{note.content}</p>
            </div>
          </div>
        ))}

        {notes?.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No notes yet. Add one above.
          </p>
        )}
      </div>
    </div>
  )
}
