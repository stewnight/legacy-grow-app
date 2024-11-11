'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form'
import { api } from '~/trpc/react'
import { useSession } from 'next-auth/react'
import { createOptimisticNote } from '~/lib/optimistic-update'
import { useToast } from '~/hooks/use-toast'
import { Mic, Send, X } from 'lucide-react'
import { cn } from '~/lib/utils'
import { MediaUploader } from './media-uploader'
import { useState } from 'react'
import Image from 'next/image'
import { Alert, AlertDescription } from '~/components/ui/alert'

const createNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  type: z.enum(['text', 'voice', 'image', 'file']).default('text'),
  entityType: z.string(),
  entityId: z.number(),
  parentId: z.number().optional(),
  metadata: z
    .object({
      duration: z.number().optional(),
      dimensions: z
        .object({
          width: z.number(),
          height: z.number(),
        })
        .optional(),
      fileSize: z.number().optional(),
      mimeType: z.string().optional(),
    })
    .nullable()
    .optional(),
})

interface CreateNoteFormProps {
  entityType: string
  entityId: number
  parentId?: number
  onSuccess?: () => void
  className?: string
}

export function CreateNoteForm({
  entityType,
  entityId,
  parentId,
  onSuccess,
  className,
}: CreateNoteFormProps) {
  const { data: session, status } = useSession()
  const utils = api.useUtils()
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaMetadata, setMediaMetadata] = useState<{
    width?: number
    height?: number
    size?: number
    type?: string
  } | null>(null)

  const form = useForm<z.infer<typeof createNoteSchema>>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      content: '',
      type: 'text',
      entityType,
      entityId,
      parentId,
    },
  })

  const createMutation = api.notes.create.useMutation({
    onMutate: async (newNote) => {
      if (!session?.user) throw new Error('Not authenticated')

      await utils.notes.list.cancel({ entityType, entityId, limit: 50 })
      const previousData = utils.notes.list.getData({
        entityType,
        entityId,
        limit: 50,
      })

      const createdBy = {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? '',
        emailVerified: null,
        image: null,
        role: 'user' as const,
        active: true,
        permissions: null,
        preferences: null,
        lastLogin: null,
        createdAt: new Date(),
      }

      const optimisticNote = {
        ...createOptimisticNote(newNote, createdBy),
        createdBy,
      }

      utils.notes.list.setData({ entityType, entityId, limit: 50 }, (old) => {
        if (!old) return { items: [], nextCursor: null }
        return {
          items: [optimisticNote, ...old.items],
          nextCursor: old.nextCursor,
        }
      })

      return { previousData }
    },
    onError: (err, newNote, context) => {
      utils.notes.list.setData(
        { entityType, entityId, limit: 50 },
        context?.previousData
      )
      toast({
        title: 'Failed to create note',
        description: 'Please try again',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      form.reset()
      setMediaUrl(null)
      setMediaMetadata(null)
      toast({
        title: 'Note created',
        description: 'Your note has been added successfully',
      })
      onSuccess?.()
    },
    onSettled: () => {
      void utils.notes.list.invalidate({ entityType, entityId, limit: 50 })
    },
  })

  async function onSubmit(values: z.infer<typeof createNoteSchema>) {
    if (!session?.user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create notes',
        variant: 'destructive',
      })
      return
    }

    const noteContent = mediaUrl ?? values.content
    if (!noteContent.trim()) return

    try {
      await createMutation.mutateAsync({
        ...values,
        content: noteContent,
        type: mediaUrl ? 'image' : 'text',
        metadata: mediaMetadata
          ? {
              dimensions:
                mediaMetadata.width && mediaMetadata.height
                  ? {
                      width: mediaMetadata.width,
                      height: mediaMetadata.height,
                    }
                  : undefined,
              fileSize: mediaMetadata.size,
              mimeType: mediaMetadata.type,
            }
          : undefined,
      })
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center p-4">
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Alert>
        <AlertDescription>Please sign in to create notes</AlertDescription>
      </Alert>
    )
  }

  const handleUploadError = (error: Error) => {
    toast({
      title: 'Upload failed',
      description: error.message,
      variant: 'destructive',
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-4', className)}
      >
        <div className="relative">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  {mediaUrl ? (
                    <div className="relative">
                      <Image
                        src={mediaUrl}
                        alt="Upload preview"
                        width={300}
                        height={300}
                        className="max-h-[200px] w-full object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
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
                    <Textarea
                      {...field}
                      placeholder="Add a note..."
                      className="min-h-[100px] pr-24"
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <MediaUploader
              onUpload={(file) => {
                console.log('uploading file', file)
              }}
              onUploadComplete={(url, metadata) => {
                setMediaUrl(url)
                setMediaMetadata(metadata)
              }}
              onUploadError={handleUploadError}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsRecording(!isRecording)}
            >
              <Mic className={cn('h-4 w-4', isRecording && 'text-red-500')} />
            </Button>
            <Button
              type="submit"
              disabled={
                (!form.getValues('content') && !mediaUrl) ||
                createMutation.isPending
              }
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
