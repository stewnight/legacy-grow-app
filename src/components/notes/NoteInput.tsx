'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Mic, Image as ImageIcon, Paperclip, Send } from 'lucide-react'
import { api } from '~/trpc/react'
import { type Note } from '~/server/db/schemas/notes'
import { cn } from '~/lib/utils'

interface NoteInputProps {
  entityType: string
  entityId: number
  parentId?: number
  onNoteSaved?: (note: Note) => void
}

export function NoteInput({
  entityType,
  entityId,
  parentId,
  onNoteSaved,
}: NoteInputProps) {
  const [content, setContent] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  const createNote = api.notes.create.useMutation({
    onSuccess: (note) => {
      if (note) {
        setContent('')
        onNoteSaved?.(note)
      }
    },
  })

  const handleSubmit = () => {
    if (!content.trim()) return

    createNote.mutate({
      content,
      type: 'text',
      entityType,
      entityId,
      parentId,
    })
  }

  return (
    <div className="space-y-4 w-full">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a note..."
        className="min-h-[100px]"
      />
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={() => setIsRecording(!isRecording)}
          >
            <Mic className={cn('h-4 w-4', isRecording && 'text-red-500')} />
          </Button>
          <Button variant="outline" size="icon" type="button">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" type="button">
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || createNote.isPending}
        >
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
      <span className="text-xs text-muted-foreground font-mono">
        Dev note: Currently only supports text notes. The other note types are
        coming soon.
      </span>
    </div>
  )
}
