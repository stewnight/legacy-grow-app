'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insertJobSchema } from '~/server/db/schema'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
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
import { type Job } from '~/server/db/schema/jobs'
import { type RouterOutputs } from '~/trpc/shared'

type RouterOutputs = inferRouterOutputs<AppRouter>
type JobFormValues = z.infer<typeof insertJobSchema>

interface JobFormProps {
  mode?: 'create' | 'edit'
  defaultValues?: RouterOutputs['job']['get']
  onSuccess?: (data: JobFormValues) => void
}

export function JobForm({
  mode = 'create',
  defaultValues,
  onSuccess,
}: JobFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = api.useUtils()

  const form = useForm<JobFormValues>({
    resolver: zodResolver(insertJobSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      priority: defaultValues?.priority || 'medium',
      category: defaultValues?.category || undefined,
      jobStatus: defaultValues?.jobStatus || 'pending',
      dueDate: defaultValues?.dueDate || undefined,
      assignedToId: defaultValues?.assignedToId || undefined,
      entityType: defaultValues?.entityType || 'none',
      entityId: defaultValues?.entityId || undefined,
      status: defaultValues?.status || 'active',
      properties: defaultValues?.properties || {
        recurring: null,
        tasks: [],
        instructions: [],
        requirements: { tools: [], supplies: [], ppe: [] },
      },
    },
  })

  const { mutate: createJob, isPending: isCreating } =
    api.job.create.useMutation({
      onSuccess: (data) => {
        toast({ title: 'Job created successfully' })
        void Promise.all([
          utils.job.getAll.invalidate(),
          utils.job.get.invalidate(data.id),
        ])
        router.push(`/jobs/${data.id}`)
        onSuccess?.(data)
      },
      onError: (error) => {
        toast({
          title: 'Error creating task',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateJob, isPending: isUpdating } =
    api.job.update.useMutation({
      onSuccess: (data) => {
        toast({ title: 'Job updated successfully' })
        void Promise.all([
          utils.job.getAll.invalidate(),
          utils.job.get.invalidate(data.id),
        ])
        onSuccess?.(data)
      },
      onError: (error) => {
        toast({
          title: 'Error updating job',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const onSubmit = async (data: JobFormValues) => {
    // Ensure entityId is null when entityType is 'none'
    const formData = {
      ...data,
      entityId: data.entityType === 'none' ? null : data.entityId,
      properties: {
        ...data.properties,
        tasks: data.properties?.tasks || [],
      },
    }

    if (mode === 'create') {
      createJob(formData)
    } else if (mode === 'edit' && defaultValues?.id) {
      updateJob({ id: defaultValues.id, data: formData })
    }
  }

  // Fetch users for assignment
  const { data: users } = api.user.getAll.useQuery()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
              <FormControl>
                <RecurringSettings
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
          name="properties.instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <InstructionsManager
                  value={field.value || []}
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
                  value={field.value || { tools: [], supplies: [], ppe: [] }}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="text-lg font-medium">Additional Information</h3>

          <FormField
            control={form.control}
            name="metadata.estimatedDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Duration (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(e.target.valueAsNumber || null)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === 'edit' && (
            <FormField
              control={form.control}
              name="metadata.actualDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actual Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="metadata.location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Details</FormLabel>
                <div className="grid gap-2">
                  <FormControl>
                    <Input
                      placeholder="Location Name"
                      value={field.value?.name || ''}
                      onChange={(e) =>
                        field.onChange({
                          ...field.value,
                          name: e.target.value,
                          type: field.value?.type || 'custom',
                          id: field.value?.id || crypto.randomUUID(),
                        })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <Input
                      placeholder="Location Type"
                      value={field.value?.type || ''}
                      onChange={(e) =>
                        field.onChange({
                          ...field.value,
                          type: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadata.previousJobs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Previous Jobs</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {field.value?.map((jobId, index) => (
                      <div key={jobId} className="flex items-center gap-2">
                        <Input
                          value={jobId}
                          onChange={(e) => {
                            const newJobs = [...(field.value || [])]
                            newJobs[index] = e.target.value
                            field.onChange(newJobs)
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newJobs = field.value?.filter(
                              (_, i) => i !== index
                            )
                            field.onChange(newJobs)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        field.onChange([...(field.value || []), ''])
                      }}
                    >
                      Add Previous Job
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadata.nextJobs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Jobs</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {field.value?.map((jobId, index) => (
                      <div key={jobId} className="flex items-center gap-2">
                        <Input
                          value={jobId}
                          onChange={(e) => {
                            const newJobs = [...(field.value || [])]
                            newJobs[index] = e.target.value
                            field.onChange(newJobs)
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newJobs = field.value?.filter(
                              (_, i) => i !== index
                            )
                            field.onChange(newJobs)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        field.onChange([...(field.value || []), ''])
                      }}
                    >
                      Add Next Job
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isCreating || isUpdating}>
          {mode === 'create' ? 'Create Task' : 'Update Task'}
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
