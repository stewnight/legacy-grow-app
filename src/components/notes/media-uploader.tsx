'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { generateStorageKey } from '~/lib/storage'
import { api } from '~/trpc/react'
import { Progress } from '~/components/ui/progress'
import { X } from 'lucide-react'
import { Button } from '~/components/ui/button'

interface MediaUploaderProps {
  onUpload: (file: File) => Promise<void> | void
  onUploadComplete: (url: string, metadata: any) => void
  onUploadError: (error: Error) => void
}

export function MediaUploader({ onUpload, onUploadComplete, onUploadError }: MediaUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const getPresignedUrl = api.media.getUploadUrl.useMutation()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      try {
        setIsUploading(true)
        const key = generateStorageKey(file)
        const { uploadUrl, publicUrl } = await getPresignedUrl.mutateAsync({
          filename: key,
          contentType: file.type,
        })

        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            setUploadProgress(progress)
          }
        })

        xhr.upload.addEventListener('load', () => {
          onUploadComplete(publicUrl, {
            mimeType: file.type,
            size: file.size,
            filename: file.name,
          })
          setIsUploading(false)
          setUploadProgress(0)
        })

        xhr.upload.addEventListener('error', () => {
          onUploadError(new Error('Upload failed'))
          setIsUploading(false)
          setUploadProgress(0)
        })

        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      } catch (error) {
        onUploadError(error instanceof Error ? error : new Error('Upload failed'))
        setIsUploading(false)
      }
    },
    [getPresignedUrl, onUploadComplete, onUploadError]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`relative rounded-lg border-2 border-dashed p-4 transition-colors ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-muted'
      }`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Uploading...</span>
            <Button variant="ghost" size="sm" onClick={() => setIsUploading(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={uploadProgress} />
        </div>
      ) : isDragActive ? (
        <p className="text-center text-sm">Drop the file here</p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Drag & drop a file here, or click to select
        </p>
      )}
    </div>
  )
}
