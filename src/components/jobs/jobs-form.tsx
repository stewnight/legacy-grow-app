'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  insertJobSchema,
  type jobPropertiesSchema,
  type taskSchema,
} from '~/server/db/schema'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type z } from 'zod'
import {
  jobStatusEnum,
  jobPriorityEnum,
  jobCategoryEnum,
  statusEnum,
  jobEntityTypeEnum,
  type JobEntityType,
} from '~/server/db/schema/enums'
import { type inferRouterOutputs } from '@trpc/server'
import { type AppRouter } from '~/server/api/root'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { DatePicker } from '@/components/ui/date-picker'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import React from 'react'
import { TaskManager } from './task-manager'
import { RecurringSettings } from './recurring-settings'
import { InstructionsManager } from './instructions-manager'
import { RequirementsManager } from './requirements-manager'
import { type JobWithRelations } from '~/server/db/schema'
import { type TRPCClientErrorLike } from '@trpc/client'

type RouterOutputs = inferRouterOutputs<AppRouter>
type JobFormValues = z.infer<typeof insertJobSchema> & {
  properties: JobProperties
  metadata: JobMetadata
}

interface JobFormProps {
  mode: 'create' | 'edit'
  defaultValues?: JobWithRelations
}

type JobProperties = z.infer<typeof jobPropertiesSchema>
type Task = z.infer<typeof taskSchema>

interface JobMetadata {
  previousJobs: string[]
  nextJobs: string[]
  estimatedDuration: number | null
  actualDuration: number | null
  location: {
    id: string
    type: string
    name: string
  } | null
}

export function JobForm({ mode, defaultValues }: JobFormProps) {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(insertJobSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      priority: defaultValues?.priority || 'low',
      jobStatus: defaultValues?.jobStatus || 'pending',
      dueDate: defaultValues?.dueDate || undefined,
      assignedToId: defaultValues?.assignedToId || undefined,
      entityType: defaultValues?.entityType || 'none',
      entityId: defaultValues?.entityId || undefined,
      status: defaultValues?.status || 'active',
      category: defaultValues?.category || 'maintenance',
      properties: {
        recurring: (defaultValues?.properties)!?.recurring || null,
        tasks: (defaultValues?.properties)!?.tasks || [],
        instructions: (defaultValues?.properties)!?.instructions || [],
        requirements: (defaultValues?.properties)!?.requirements || {
          tools: [],
          supplies: [],
          ppe: [],
        },
      } satisfies JobProperties,
      metadata: {
        previousJobs: [],
        nextJobs: [],
        estimatedDuration: null,
        actualDuration: null,
        location: null,
      },
    },
  })

  const utils = api.useUtils()
  const { toast } = useToast()
  const router = useRouter()

  const { mutate: createJob, isPending: isCreating } =
    api.job.create.useMutation({
      onSuccess: async () => {
        toast({
          title: 'Job created successfully',
        })
        await utils.job.invalidate()
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error creating job',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateJob, isPending: isUpdating } =
    api.job.update.useMutation({
      onSuccess: async () => {
        toast({
          title: 'Job updated successfully',
        })
        await utils.job.invalidate()
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error updating job',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const onSubmit = async (data: JobFormValues) => {
    try {
      const formData = {
        ...data,
        entityId: data.entityType === 'none' ? null : data.entityId,
        properties: {
          recurring: (data.properties as JobProperties).recurring || null,
          tasks: (data.properties as JobProperties).tasks || [],
          instructions: (data.properties as JobProperties).instructions || [],
          requirements: (data.properties as JobProperties).requirements || {
            tools: [],
            supplies: [],
            ppe: [],
          },
        },
        metadata: {
          ...(data.metadata as JobMetadata),
          device: 'web',
          updatedAt: new Date().toISOString(),
        },
      }

      if (mode === 'create') {
        createJob(formData)
      } else if (defaultValues?.id) {
        updateJob({ id: defaultValues.id, data: formData })
      }
    } catch (error) {
      toast({
        title: 'Error submitting form',
        description: error as string,
        variant: 'destructive',
      })
    }
  }

  // Fetch users for assignment
  const { data: users } = api.user.getAll.useQuery()

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit(async (data: JobFormValues) => {
            try {
              const formData = {
                ...data,
                entityId: data.entityType === 'none' ? null : data.entityId,
                properties: {
                  recurring:
                    (data.properties as JobProperties).recurring || null,
                  tasks: (data.properties as JobProperties).tasks || [],
                  instructions:
                    (data.properties as JobProperties).instructions || [],
                  requirements: (data.properties as JobProperties)
                    .requirements || {
                    tools: [],
                    supplies: [],
                    ppe: [],
                  },
                },
                metadata: {
                  ...(data.metadata as JobMetadata),
                  device: 'web',
                  updatedAt: new Date().toISOString(),
                },
              }

              if (mode === 'create') {
                createJob(formData)
              } else if (defaultValues?.id) {
                updateJob({ id: defaultValues.id, data: formData })
              }
            } catch (error) {
              console.error('Form submission error:', error)
            }
          })(e)
        }}
        className="space-y-4 p-1"
        noValidate
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="entityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entity Type</FormLabel>
                <FormDescription>
                  The entity type is the type of entity that this job is related
                  to.
                </FormDescription>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jobEntityTypeEnum.enumValues.map((type) => (
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
        </div>

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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jobStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {jobStatusEnum.enumValues.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
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
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {jobCategoryEnum.enumValues.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
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
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {jobPriorityEnum.enumValues.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
          name="assignedToId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign To</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
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
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <DatePicker
                date={field.value ? new Date(field.value) : null}
                onDateChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="properties.tasks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tasks</FormLabel>
              <FormControl>
                <TaskManager
                  tasks={field.value || []}
                  onChange={(tasks) => {
                    form.setValue('properties.tasks', tasks, {
                      shouldValidate: true,
                    })
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="properties.recurring"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recurring Settings</FormLabel>
              <FormControl>
                <RecurringSettings
                  value={field.value || null}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="properties.instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <InstructionsManager
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="properties.requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirements</FormLabel>
              <FormControl>
                <RequirementsManager
                  value={
                    field.value || {
                      tools: [],
                      supplies: [],
                      ppe: [],
                    }
                  }
                  onChange={field.onChange}
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
            'Create Job'
          ) : (
            'Update Job'
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
  entityType: JobEntityType
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
  const geneticQuery = api.genetic.getAll.useQuery(
    { limit: 50 },
    { enabled: entityType === 'genetics' }
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
      case 'genetics':
        return geneticQuery
      case 'sensors':
        return sensorQuery
      case 'processing':
        return processingQuery
      case 'harvest':
        return harvestQuery
      case 'none':
        return { data: null, isLoading: false }
      default:
        return { data: null, isLoading: false }
    }
  }, [
    entityType,
    equipmentQuery,
    locationQuery,
    plantQuery,
    batchQuery,
    geneticQuery,
    sensorQuery,
    processingQuery,
    harvestQuery,
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
      case 'genetics':
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
