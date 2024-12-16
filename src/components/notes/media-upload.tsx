'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '~/components/ui/button'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'
import { Image, Loader2, Upload, X } from 'lucide-react'

interface MediaUploadProps {
  value?: Array<{
    type: string
    url: string
    thumbnail?: string
    metadata?: Record<string, unknown>
  }>
  onChange: (
    value: Array<{
      type: string
      url: string
      thumbnail?: string
      metadata?: Record<string, unknown>
    }>
  ) => void
}

export function MediaUpload({ value = [], onChange }: MediaUploadProps) {
  const { toast } = useToast()
  const { mutateAsync: getUploadUrl } = api.media.getUploadUrl.useMutation()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        // For now, just handle images
        const imageFiles = acceptedFiles.filter((file) =>
          file.type.startsWith('image/')
        )

        if (!imageFiles.length) {
          toast({
            title: 'Invalid file type',
            description: 'Only images are supported for now',
            variant: 'destructive',
          })
          return
        }

        // Simple loading state
        toast({
          title: 'Uploading...',
          description: 'Please wait while we upload your files',
        })

        // Process each file
        const newMedia = await Promise.all(
          imageFiles.map(async (file) => {
            // Get upload URL
            const { uploadUrl, publicUrl } = await getUploadUrl({
              filename: file.name,
              contentType: file.type,
            })

            // For now, just simulate upload
            console.log('Would upload to:', uploadUrl)

            // Return media object
            return {
              type: file.type,
              url: publicUrl,
              thumbnail: publicUrl,
              metadata: {
                name: file.name,
                size: file.size,
                type: file.type,
              },
            }
          })
        )

        // Update form value
        onChange([...value, ...newMedia])

        toast({
          title: 'Upload complete',
          description: `Successfully uploaded ${newMedia.length} files`,
        })
      } catch (error) {
        console.error('Upload error:', error)
        toast({
          title: 'Upload failed',
          description: 'There was an error uploading your files',
          variant: 'destructive',
        })
      }
    },
    [getUploadUrl, onChange, toast, value]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-muted-foreground/25 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          {isDragActive ? (
            <p>Drop the files here...</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Drag & drop files here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Only images supported for now
              </p>
            </>
          )}
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((item, index) => (
            <div
              key={index}
              className="group relative aspect-square rounded-lg border bg-muted"
            >
              {item.type.startsWith('image/') ? (
                <img
                  src={item.thumbnail ?? item.url}
                  alt={item.metadata?.name as string}
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Image className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 hidden h-6 w-6 group-hover:flex"
                onClick={() => {
                  const newValue = [...value]
                  newValue.splice(index, 1)
                  onChange(newValue)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
