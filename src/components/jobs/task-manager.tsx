'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Clock } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const taskFormSchema = z.object({
  item: z.string().min(1, 'Task description is required'),
  estimatedMinutes: z.number().nullable().optional(),
})

interface TaskManagerProps {
  tasks: Array<{
    item: string
    completed: boolean
    completedAt?: string | null
    estimatedMinutes?: number | null
    actualMinutes?: number | null
    startedAt?: string | null
  }>
  onChange: (
    tasks: Array<{
      item: string
      completed: boolean
      completedAt?: string | null
      estimatedMinutes?: number | null
      actualMinutes?: number | null
      startedAt?: string | null
    }>
  ) => void
}

export function TaskManager({ tasks, onChange }: TaskManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    initialData: {
      item: '',
      estimatedMinutes: null,
    },
  })

  const addTask = (values: z.infer<typeof taskFormSchema>) => {
    onChange([
      ...tasks,
      {
        item: values.item.trim(),
        completed: false,
        completedAt: null,
        estimatedMinutes: values.estimatedMinutes,
        actualMinutes: null,
        startedAt: null,
      },
    ])
    form.reset()
    setDialogOpen(false)
  }

  const removeTask = (index: number) => {
    const updatedTasks = tasks.filter((_, i) => i !== index)
    onChange(updatedTasks)
  }

  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return null
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addTask)} className="space-y-4">
              <FormField
                control={form.control}
                name="item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter task description..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value ? parseInt(value, 10) : null)
                        }}
                        placeholder="Enter estimated duration..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Task</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ScrollArea className="h-[200px] rounded-md border p-2">
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3 text-card-foreground"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{task.item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTask(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {task.estimatedMinutes && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Estimated: {formatDuration(task.estimatedMinutes)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No tasks added
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
