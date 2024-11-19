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
} from '~/server/db/schema/enums'
import { type inferRouterOutputs } from '@trpc/server'
import { type AppRouter } from '~/server/api/root'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { DatePicker } from '@/components/ui/date-picker'
import { Textarea } from '@/components/ui/textarea'

type RouterOutputs = inferRouterOutputs<AppRouter>
type TaskFormValues = z.infer<typeof insertTaskSchema>

interface TaskFormProps {
  mode?: 'create' | 'edit'
  defaultValues?: RouterOutputs['task']['get']
  onSuccess?: (data: TaskFormValues) => void
  entityId?: string
  entityType?: string
}

export function TaskForm({
  mode = 'create',
  defaultValues,
  onSuccess,
  entityId,
  entityType,
}: TaskFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = api.useUtils()

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      entityId: entityId || defaultValues?.entityId || '',
      entityType: entityType || defaultValues?.entityType || '',
      category: defaultValues?.category || 'maintenance',
      priority: defaultValues?.priority || 'medium',
      taskStatus: defaultValues?.taskStatus || 'pending',
      status: defaultValues?.status || 'active',
      assignedToId: defaultValues?.assignedToId || undefined,
      dueDate: defaultValues?.dueDate
        ? new Date(defaultValues.dueDate)
        : undefined,
      properties: defaultValues?.properties || {
        recurring: undefined,
        checklist: [],
        instructions: [],
        requirements: {
          tools: [],
          supplies: [],
          ppe: [],
        },
      },
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

  function onSubmit(values: TaskFormValues) {
    if (mode === 'create') {
      createTask(values)
    } else if (defaultValues?.id) {
      updateTask({ id: defaultValues.id, data: values })
    }
  }

  // Fetch users for assignment
  const { data: users } = api.user.getAll.useQuery()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
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

        <FormField
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
        />

        <Button type="submit" disabled={isCreating || isUpdating}>
          {mode === 'create' ? 'Create Task' : 'Update Task'}
        </Button>
      </form>
    </Form>
  )
}
