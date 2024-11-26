'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insertTaskSchema } from '~/server/db/schema'
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
  taskStatusEnum,
  taskPriorityEnum,
  taskCategoryEnum,
  statusEnum,
  taskEntityTypeEnum,
  type TaskEntityType,
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

type RouterOutputs = inferRouterOutputs<AppRouter>
type TaskFormValues = z.infer<typeof insertTaskSchema>

interface TaskFormProps {
  mode?: 'create' | 'edit'
  defaultValues?: RouterOutputs['task']['get']
  onSuccess?: (data: TaskFormValues) => void
}

export function TaskForm({
  mode = 'create',
  defaultValues,
  onSuccess,
}: TaskFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = api.useUtils()

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      priority: defaultValues?.priority || 'medium',
      category: defaultValues?.category || undefined,
      taskStatus: defaultValues?.taskStatus || 'pending',
      dueDate: defaultValues?.dueDate || undefined,
      assignedToId: defaultValues?.assignedToId || undefined,
      entityType: defaultValues?.entityType || 'none',
      entityId: defaultValues?.entityId || undefined,
      status: defaultValues?.status || 'active',
    },
  })

  const { mutate: createTask, isPending: isCreating } =
    api.task.create.useMutation({
      onSuccess: (data) => {
        toast({ title: 'Task created successfully' })
        void Promise.all([
          utils.task.getAll.invalidate(),
          utils.task.get.invalidate(data.id),
        ])
        router.push(`/tasks/${data.id}`)
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

  const { mutate: updateTask, isPending: isUpdating } =
    api.task.update.useMutation({
      onSuccess: (data) => {
        toast({ title: 'Task updated successfully' })
        void Promise.all([
          utils.task.getAll.invalidate(),
          utils.task.get.invalidate(data.id),
        ])
        onSuccess?.(data)
      },
      onError: (error) => {
        toast({
          title: 'Error updating task',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const onSubmit = async (data: TaskFormValues) => {
    // Ensure entityId is null when entityType is 'none'
    const formData = {
      ...data,
      entityId: data.entityType === 'none' ? null : data.entityId,
    }

    if (mode === 'create') {
      createTask(formData)
    } else if (mode === 'edit' && defaultValues?.id) {
      updateTask({ id: defaultValues.id, data: formData })
    }
  }

  // Fetch users for assignment
  const { data: users } = api.user.getAll.useQuery()

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          console.log('Form Submitted Event')
          form.handleSubmit(onSubmit, (errors) => {
            console.log('Form Errors:', errors)
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
                    {taskEntityTypeEnum.enumValues.map((type) => (
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
          name="taskStatus"
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
                  {taskStatusEnum.enumValues.map((status) => (
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
                  {taskCategoryEnum.enumValues.map((category) => (
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
                  {taskPriorityEnum.enumValues.map((priority) => (
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

        {/* <FormField
          control={form.control}
          name="status"
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
                  {statusEnum.enumValues.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        /> */}

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
  entityType: TaskEntityType
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
