'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Volume2, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { type Note } from '~/server/db/schemas/notes'

interface MediaPreviewProps {
  note: Note
  className?: string
}

export function MediaPreview({ note, className }: MediaPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Early return if no metadata or URL
  if (!note.metadata?.url) return null

  // Safely access the URL
  const mediaUrl = note.metadata.url as string

  const renderPreview = () => {
    switch (note.type) {
      case 'image':
        return (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image
              src={mediaUrl}
              alt={note.content}
              fill
              className="object-cover"
              onClick={() => setIsOpen(true)}
              unoptimized // For external URLs
            />
          </div>
        )
      case 'voice':
        return (
          <div className="flex items-center gap-2 rounded-md border p-4">
            <Volume2 className="h-4 w-4" />
            <audio controls src={mediaUrl} className="w-full" />
          </div>
        )
      case 'file':
        return (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md border p-4 hover:bg-accent"
          >
            <FileText className="h-4 w-4" />
            <span className="flex-1 truncate">{note.content}</span>
          </a>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className={className}>{renderPreview()}</div>

      {note.type === 'image' && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{note.content}</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={mediaUrl}
                alt={note.content}
                fill
                className="object-contain"
                unoptimized // For external URLs
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
} 