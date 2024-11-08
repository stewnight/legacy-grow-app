'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Mic, Send, X } from 'lucide-react'
import { api } from '~/trpc/react'
import { type Note } from '~/server/db/schemas/notes'
import { cn } from '~/lib/utils'
import { MediaUploader } from './MediaUploader'
import { toast } from '~/hooks/use-toast'
import Image from 'next/image'

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
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaMetadata, setMediaMetadata] = useState<Record<
    string,
    any
  > | null>(null)

  const createNote = api.notes.create.useMutation({
    onSuccess: (note) => {
      if (note) {
        setContent('')
        setMediaUrl(null)
        setMediaMetadata(null)
        onNoteSaved?.(note)
      }
    },
  })

  const handleSubmit = () => {
    if (!content.trim() && !mediaUrl) return

    createNote.mutate({
      content: mediaUrl ?? content,
      type: mediaUrl ? 'image' : 'text',
      entityType,
      entityId,
      parentId,
      metadata: mediaMetadata ?? undefined,
    })
  }

  const handleUploadComplete = (url: string, metadata: any) => {
    setMediaUrl(url)
    setMediaMetadata(metadata)
  }

  const handleUploadError = (error: Error) => {
    toast({
      title: 'Upload Error',
      description: error.message,
      variant: 'destructive',
    })
  }

  return (
    <div className="space-y-4 w-full">
      {!mediaUrl && (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a note..."
          className="min-h-[100px]"
        />
      )}

      {mediaUrl ? (
        <div className="relative rounded-lg border overflow-hidden">
          <Image
            src={mediaUrl}
            alt="Upload preview"
            className="max-h-[300px] w-full object-contain"
            width={300}
            height={300}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => {
              setMediaUrl(null)
              setMediaMetadata(null)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <MediaUploader
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      )}

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
        </div>
        <Button
          onClick={handleSubmit}
          disabled={(!content.trim() && !mediaUrl) || createNote.isPending}
        >
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  )
}
