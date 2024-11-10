'use client'

import { api } from '~/trpc/react'
import { NoteCard } from './NoteCard'
import { Button } from '~/components/ui/button'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { type Note } from '~/server/db/schemas/notes'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Alert, AlertDescription } from '~/components/ui/alert'

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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = api.notes.list.useInfiniteQuery(
    {
      entityType,
      entityId,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage])

  if (status === 'pending') {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load notes: {error.message}{' '}
          <Button variant="link" onClick={() => void fetchNextPage()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <ScrollArea className="max-h-[600px] pr-4">
      <div className="space-y-4">
        {data?.pages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">
            No notes found
          </div>
        )}
        {data?.pages.map((page, i) => (
          <div key={i} className="space-y-4">
            {page.items.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ))}

        <div ref={ref} className="h-8">
          {isFetchingNextPage && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
