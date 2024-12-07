'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'
import Image from 'next/image'

interface MediaUploadProps {
  onUploadComplete: (url: string) => void
  maxSize?: number // in MB
  accept?: string
  className?: string
}

type PresignedPostFields = Record<string, string>

export function MediaUpload({
  onUploadComplete,
  maxSize = 10,
  accept = 'image/*',
  className,
}: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const { mutateAsync: getUploadUrl } = api.media.getUploadUrl.useMutation()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `File size must be less than ${maxSize}MB`,
        variant: 'destructive',
      })
      return
    }

    setFile(selectedFile)

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      // Get presigned URL
      const { uploadUrl, publicUrl } = await getUploadUrl({
        filename: file.name,
        contentType: file.type,
      })

      // Upload file with progress tracking
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100
          setProgress(percentComplete)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 204) {
          onUploadComplete(publicUrl)
          setFile(null)
          setPreview(null)
          setProgress(0)
        } else {
          throw new Error('Upload failed')
        }
      }

      xhr.onerror = () => {
        throw new Error('Upload failed')
      }

      // Create FormData and append file
      const formData = new FormData()
      formData.append('file', file)

      xhr.open('PUT', uploadUrl, true)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(formData)
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your file.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className={className}>
      {!file && (
        <div className="flex items-center justify-center">
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 p-4 hover:border-gray-400"
          >
            <Upload className="h-4 w-4" />
            <span>Upload media</span>
          </label>
        </div>
      )}

      {file && (
        <div className="space-y-4">
          {preview && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image src={preview} alt="Preview" fill className="object-cover" />
            </div>
          )}

          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFile(null)
                setPreview(null)
                setProgress(0)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={handleUpload} disabled={progress > 0 && progress < 100}>
            Upload
          </Button>
        </div>
      )}
    </div>
  )
}
