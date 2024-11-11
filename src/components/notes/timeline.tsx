'use client'

import { api } from '~/trpc/react'
import { NoteCard } from './note-card'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { type Note } from '~/server/db/schemas/notes'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { CreateNoteForm } from './create-note-form'

interface TimelineProps {
  entityType: string
  entityId: number
  onReply?: (noteId: number) => void
  onEdit?: (note: Note) => void
  onDelete?: (noteId: number) => void
}

export function Timeline({
  entityType,
  entityId,
  onReply,
  onEdit,
  onDelete,
}: TimelineProps) {
  const { ref, inView } = useInView()

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = api.notes.list.useInfiniteQuery(
    {
      entityType,
      entityId,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      enabled: true,
    }
  )

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load notes</AlertDescription>
      </Alert>
    )
  }

  const notes = data?.pages.flatMap((page) => page.items) ?? []
  const isEmpty = !isLoading && notes.length === 0

  return (
    <div className="space-y-4">
      <CreateNoteForm entityType={entityType} entityId={entityId} />

      <ScrollArea className="h-[600px] rounded-md border p-4">
        <div className="space-y-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

          {isEmpty && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              No notes yet. Add one to get started.
            </div>
          )}

          <div ref={ref} className="py-2">
            {isFetchingNextPage && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
