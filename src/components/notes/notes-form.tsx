'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insertNoteSchema, type NoteWithRelations } from '~/server/db/schema'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { type AppRouter } from '~/server/api/root'
import { type inferRouterOutputs } from '@trpc/server'
import { z } from 'zod'
import { type TRPCClientErrorLike } from '@trpc/client'
import { Loader2, Plus, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { noteTypeEnum } from '~/server/db/schema/enums'
import { Badge } from '../ui/badge'
import { MediaUpload } from './media-upload'
import React from 'react'

type SimplifiedProperties = {
  tags?: string[]
  media?: Array<{
    type: string
    url: string
    thumbnail?: string
    metadata?: Record<string, unknown>
  }>
}

type NoteFormValues = {
  title: string
  content?: string
  type: string
  entityType: string
  entityId?: string
  properties: SimplifiedProperties
}

const noteFormSchema = insertNoteSchema
  .pick({
    title: true,
    content: true,
    type: true,
    entityType: true,
    entityId: true,
  })
  .extend({
    properties: z.object({
      tags: z.array(z.string()).optional(),
      media: z
        .array(
          z.object({
            type: z.string(),
            url: z.string(),
            thumbnail: z.string().optional(),
            metadata: z.record(z.unknown()).optional(),
          })
        )
        .optional(),
    }),
  })

type RouterOutputs = inferRouterOutputs<AppRouter>

interface NoteFormProps {
  mode: 'create' | 'edit'
  initialData?: NoteWithRelations
}

export function NoteForm({ mode, initialData }: NoteFormProps) {
  const utils = api.useUtils()
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      content: initialData?.content ?? '',
      type: initialData?.type ?? 'text',
      entityType: initialData?.entityType ?? 'none',
      entityId: initialData?.entityId ?? undefined,
      properties: {
        tags: initialData?.properties?.tags ?? [],
        media: initialData?.properties?.media ?? [],
      },
    },
  })

  const { mutate: createNote, isPending: isCreating } =
    api.note.create.useMutation({
      onSuccess: async () => {
        toast({ title: 'Note created successfully' })
        await utils.note.invalidate()
        router.push('/notes')
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error creating note',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateNote, isPending: isUpdating } =
    api.note.update.useMutation({
      onSuccess: async () => {
        toast({ title: 'Note updated successfully' })
        await utils.note.invalidate()
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error updating note',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const onSubmit = async (data: NoteFormValues) => {
    try {
      const formData = {
        ...data,
        entityId: data.entityType === 'none' ? null : data.entityId,
        properties: {
          tags: data.properties.tags ?? [],
          media: data.properties.media ?? [],
        },
      }
      if (mode === 'create') {
        createNote(formData as z.infer<typeof insertNoteSchema>)
      } else if (initialData?.id) {
        updateNote({
          id: initialData.id,
          data: formData as z.infer<typeof insertNoteSchema>,
        })
      }
    } catch (error) {
      toast({
        title: 'Error submitting form',
        description: error as string,
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-1"
        noValidate
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {noteTypeEnum.enumValues.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="entityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entity Type</FormLabel>
              <FormDescription>
                The entity type this note is related to.
              </FormDescription>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="plant">Plant</SelectItem>
                  <SelectItem value="batch">Batch</SelectItem>
                  <SelectItem value="harvest">Harvest</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="sensor">Sensor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch('entityType') !== 'none' && (
          <FormField
            control={form.control}
            name="entityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select {form.watch('entityType')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={`Select ${form.watch('entityType')}`}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <EntitySelector
                      entityType={form.watch('entityType')}
                      onSelect={field.onChange}
                    />
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="properties.tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-2">
                {field.value?.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        const newTags = [...(field.value ?? [])]
                        newTags.splice(index, 1)
                        form.setValue('properties.tags', newTags)
                      }}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Input
                  placeholder="Add tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.currentTarget
                      const value = input.value.trim()
                      if (value) {
                        const newTags = [
                          ...(field.value ?? []),
                          value,
                        ] as string[]
                        form.setValue('properties.tags', newTags)
                        input.value = ''
                      }
                    }
                  }}
                  className="w-24 flex-grow"
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="properties.media"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Media</FormLabel>
              <FormControl>
                <MediaUpload
                  value={field.value ?? []}
                  onChange={(media) =>
                    form.setValue(
                      'properties.media',
                      media as SimplifiedProperties['media']
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isCreating || isUpdating}
          className="w-full"
        >
          {isCreating || isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : mode === 'create' ? (
            'Create Note'
          ) : (
            'Update Note'
          )}
        </Button>
      </form>
    </Form>
  )
}

const EntitySelector = React.memo(function EntitySelector({
  entityType,
  onSelect,
}: {
  entityType: string
  onSelect: (value: string) => void
}) {
  const equipmentQuery = api.equipment.getAll.useQuery(
    { limit: 50 },
    { enabled: entityType === 'equipment' }
  )
  const locationQuery = api.location.getAll.useQuery(
    { limit: 50 },
    { enabled: entityType === 'location' }
  )
  const plantQuery = api.plant.getAll.useQuery(
    { limit: 50 },
    { enabled: entityType === 'plant' }
  )
  const batchQuery = api.batch.getAll.useQuery(
    { limit: 50 },
    { enabled: entityType === 'batch' }
  )
  const sensorQuery = api.sensor.getAll.useQuery(
    { limit: 50 },
    { enabled: entityType === 'sensors' }
  )
  const processingQuery = api.processing.getAll.useQuery(
    { limit: 50 },
    { enabled: entityType === 'processing' }
  )
  const harvestQuery = api.harvest.getAll.useQuery(
    { limit: 50 },
    { enabled: entityType === 'harvest' }
  )
  const jobQuery = api.job.getAll.useQuery(
    { limit: 50 },
    { enabled: entityType === 'job' }
  )

  const queryResult = React.useMemo(() => {
    switch (entityType) {
      case 'equipment':
        return equipmentQuery
      case 'location':
        return locationQuery
      case 'plant':
        return plantQuery
      case 'batch':
        return batchQuery
      case 'sensors':
        return sensorQuery
      case 'processing':
        return processingQuery
      case 'harvest':
        return harvestQuery
      case 'job':
        return jobQuery
      default:
        return { data: null, isLoading: false }
    }
  }, [
    entityType,
    equipmentQuery,
    locationQuery,
    plantQuery,
    batchQuery,
    sensorQuery,
    processingQuery,
    harvestQuery,
    jobQuery,
  ])

  if (queryResult.isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (!queryResult.data?.items?.length) {
    return <SelectItem value="none">No items found</SelectItem>
  }

  const getDisplayText = (item: any) => {
    switch (entityType) {
      case 'equipment':
        return item.name
      case 'location':
        return item.name
      case 'batch':
        return item.identifier
      case 'plant':
        return `${item.identifier || item.id}`
      case 'sensors':
        return item.identifier
      case 'processing':
      case 'harvest':
        return item.identifier || item.id
      case 'job':
        return item.title
      default:
        return item.id
    }
  }

  return (
    <>
      {queryResult.data.items.map((item: any) => (
        <SelectItem key={item.id} value={item.id}>
          {getDisplayText(item)}
        </SelectItem>
      ))}
    </>
  )
})
