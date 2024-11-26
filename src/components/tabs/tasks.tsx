import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '../ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { api } from '~/trpc/react'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
import { format } from 'date-fns'
import Link from 'next/link'
import { AppSheet } from '../layout/app-sheet'
import { TaskForm } from '~/app/(app)/tasks/_components/tasks-form'
import { Button } from '../ui/button'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface TasksTabProps {
  entityId: string
  entityType:
    | 'location'
    | 'plant'
    | 'batch'
    | 'genetics'
    | 'sensors'
    | 'processing'
    | 'harvest'
}

export default function TasksTab({ entityId, entityType }: TasksTabProps) {
  const [showCompleted, setShowCompleted] = useState(false)

  const { data: tasks, isLoading } = api.task.getAll.useQuery({
    filters: {
      entityId: entityId ?? undefined,
      entityType: entityType ?? undefined,
    },
  })

  const utils = api.useUtils()

  const { mutate: updateTaskStatus } = api.task.update.useMutation({
    onSuccess: () => {
      void utils.task.getAll.invalidate()
    },
  })

  const formatDate = (date: Date | string | null): string => {
    if (!date) return 'N/A'
    return format(new Date(date), 'PP')
  }

  const handleStatusChange = (taskId: string) => {
    updateTaskStatus({
      id: taskId,
      data: {
        taskStatus: 'completed',
        completedAt: new Date(),
      },
    })
  }

  const activeTasks =
    tasks?.items.filter(
      (task) => task.taskStatus !== 'completed' && task.entityId === entityId
    ) || []
  const completedTasks =
    tasks?.items.filter(
      (task) => task.taskStatus === 'completed' && task.entityId === entityId
    ) || []

  return (
    <TabsContent value="tasks">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Tasks</CardTitle>
              <CardDescription>
                Tasks related to this {entityType}
              </CardDescription>
            </div>
            <AppSheet mode="create" entity="task">
              <TaskForm
                mode="create"
                defaultValues={{
                  entityType: entityType ?? 'none',
                  entityId: entityId ?? null,
                  status: 'active',
                }}
              />
            </AppSheet>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading tasks...</p>
            ) : activeTasks.length > 0 ? (
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between border rounded p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={task.taskStatus === 'completed'}
                        onCheckedChange={() => handleStatusChange(task.id)}
                        disabled={task.taskStatus === 'completed'}
                      />
                      <div>
                        <Link
                          href={`/tasks/${task.id}`}
                          className="font-medium hover:underline"
                        >
                          {task.title}
                        </Link>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{task.category}</Badge>
                          <Badge
                            variant={
                              task.priority === 'high'
                                ? 'destructive'
                                : task.priority === 'medium'
                                  ? 'default'
                                  : 'secondary'
                            }
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Due: {formatDate(task.dueDate)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        task.taskStatus === 'completed'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {task.taskStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No active tasks found</p>
            )}
          </CardContent>
        </Card>

        {completedTasks.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Completed Tasks</CardTitle>
                <CardDescription>
                  {completedTasks.length} completed task
                  {completedTasks.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            {showCompleted && (
              <CardContent>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between py-2 text-sm text-muted-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="hover:underline"
                        >
                          {task.title}
                        </Link>
                        <span>•</span>
                        <span>{task.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {task.category}
                        </Badge>
                        <span>Completed: {formatDate(task.completedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </TabsContent>
  )
}
