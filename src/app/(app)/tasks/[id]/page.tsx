'use client'

import * as React from 'react'
import { api } from '~/trpc/react'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Skeleton } from '~/components/ui/skeleton'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Tag,
  ListChecks,
  Timer,
  Wrench,
  Package,
  HardHat,
  Link as LinkIcon,
} from 'lucide-react'
import { AppSheet } from '../../../../components/layout/app-sheet'
import { TaskForm } from '../_components/tasks-form'
import { Badge } from '../../../../components/ui/badge'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type Task, type TaskWithRelations } from '~/server/db/schema/jobs'
import { type Location } from '~/server/db/schema/locations'
import { type Plant } from '~/server/db/schema/plants'
import { type Batch } from '~/server/db/schema/batches'
import { type Genetic } from '~/server/db/schema/genetics'
import { type Sensor } from '~/server/db/schema/sensors'
import { type Processing } from '~/server/db/schema/processing'
import { type Harvest } from '~/server/db/schema/harvests'

export default function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)

  const { data: task, isLoading } = api.task.get.useQuery(resolvedParams.id, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const utils = api.useUtils()

  const { mutate: updateTaskStatus } = api.task.update.useMutation({
    onSuccess: () => {
      void utils.task.get.invalidate(resolvedParams.id)
    },
  })

  const { mutate: updateTaskChecklist } = api.task.update.useMutation({
    onSuccess: () => {
      void utils.task.get.invalidate(resolvedParams.id)
    },
  })

  const formatDate = (date: Date | string | null): string => {
    if (!date) return 'N/A'
    return format(new Date(date), 'PP')
  }

  const handleStatusChange = (
    newStatus: 'completed' | 'pending' | 'in_progress'
  ) => {
    if (task) {
      updateTaskStatus({
        id: task.id,
        data: {
          taskStatus: newStatus,
          completedAt: newStatus === 'completed' ? new Date() : null,
        },
      })
    }
  }

  const handleChecklistItemToggle = (index: number) => {
    if (task?.properties?.checklist) {
      const checklist = [...task.properties.checklist]
      const item = checklist[index]
      if (item) {
        checklist[index] = {
          ...item,
          completed: !item.completed,
          completedAt: !item.completed ? new Date().toISOString() : null,
        }

        updateTaskChecklist({
          id: task.id,
          data: {
            properties: {
              ...task.properties,
              checklist,
            },
          },
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!task) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{task.title}</h2>
          <p className="text-muted-foreground">
            Created by {task.createdBy.name} on {formatDate(task.createdAt)}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {task.taskStatus !== 'completed' && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange('completed')}
              className="w-full sm:w-auto"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          )}
          <AppSheet mode="edit" entity="task">
            <TaskForm mode="edit" defaultValues={task} />
          </AppSheet>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {task.taskStatus === 'completed' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : task.taskStatus === 'pending' ? (
              <Clock className="h-4 w-4 text-yellow-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-blue-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {task.taskStatus}
            </div>
            <p className="text-xs text-muted-foreground">Current status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(task.dueDate)}</div>
            <p className="text-xs text-muted-foreground">Task deadline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priority</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{task.priority}</div>
            <p className="text-xs text-muted-foreground">Task priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{task.category}</div>
            <p className="text-xs text-muted-foreground">Task type</p>
          </CardContent>
        </Card>

        {task.entityType !== 'none' && task.entityId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Linked Entity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Type:{' '}
                  {task.entityType.charAt(0).toUpperCase() +
                    task.entityType.slice(1)}
                </p>
                <Link
                  href={`/${task.entityType}s/${task.entityId}`}
                  className="text-sm text-blue-500 hover:underline"
                >
                  {getEntityName(task as TaskWithRelations)}
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="details" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="details">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Description
                    </dt>
                    <dd className="text-sm">{task.description || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Assigned To
                    </dt>
                    <dd className="text-sm">
                      {task.assignedTo?.name || 'Unassigned'}
                    </dd>
                  </div>
                  {task.entityType && task.entityId && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Related To
                      </dt>
                      <dd className="flex items-center gap-2 text-sm">
                        <LinkIcon className="h-4 w-4" />
                        <Link
                          href={`/${task.entityType}s/${task.entityId}`}
                          className="hover:underline"
                        >
                          {task.entityType.charAt(0).toUpperCase() +
                            task.entityType.slice(1)}
                        </Link>
                      </dd>
                    </div>
                  )}
                  {task.startedAt && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Started
                      </dt>
                      <dd className="text-sm">{formatDate(task.startedAt)}</dd>
                    </div>
                  )}
                  {task.completedAt && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Completed
                      </dt>
                      <dd className="text-sm">
                        {formatDate(task.completedAt)}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {task.properties?.recurring && (
              <Card>
                <CardHeader>
                  <CardTitle>Recurring Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Frequency
                      </dt>
                      <dd className="text-sm capitalize">
                        {task.properties.recurring.frequency}
                      </dd>
                    </div>
                    {task.properties.recurring.interval && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Interval
                        </dt>
                        <dd className="text-sm">
                          Every {task.properties.recurring.interval}{' '}
                          {task.properties.recurring.frequency}
                        </dd>
                      </div>
                    )}
                    {task.properties.recurring.endDate && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          End Date
                        </dt>
                        <dd className="text-sm">
                          {formatDate(task.properties.recurring.endDate)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle>Task Checklist</CardTitle>
              <CardDescription>Steps to complete this task</CardDescription>
            </CardHeader>
            <CardContent>
              {task.properties?.checklist &&
              task.properties.checklist.length > 0 ? (
                <div className="space-y-4">
                  {task.properties.checklist.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border rounded p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() =>
                            handleChecklistItemToggle(index)
                          }
                        />
                        <div>
                          <p className="font-medium">{item.item}</p>
                          {item.completedAt && (
                            <p className="text-sm text-muted-foreground">
                              Completed: {formatDate(item.completedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={item.completed ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {item.completed ? 'Done' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No checklist items</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <div className="grid gap-4 md:grid-cols-3">
            {task.properties?.requirements && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {task.properties.requirements.tools?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {task.properties.requirements.tools.map((tool) => (
                          <Badge key={tool} variant="secondary">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No tools required</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Supplies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {task.properties.requirements.supplies?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {task.properties.requirements.supplies.map((supply) => (
                          <Badge key={supply} variant="secondary">
                            {supply}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No supplies required
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardHat className="h-4 w-4" />
                      PPE
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {task.properties.requirements.ppe?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {task.properties.requirements.ppe.map((ppe) => (
                          <Badge key={ppe} variant="secondary">
                            {ppe}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No PPE required</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional notes and comments</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Notes implementation here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to get entity name
function getEntityName(
  task: TaskWithRelations & {
    location?: Location
    plant?: Plant
    batch?: Batch
    genetic?: Genetic
    sensor?: Sensor
    processing?: Processing
    harvest?: Harvest
  }
) {
  switch (task.entityType) {
    case 'location':
      return task.location?.name
    case 'plant':
      return task.plant?.identifier
    case 'batch':
      return task.batch?.identifier
    case 'genetics':
      return task.genetic?.name
    case 'sensors':
      return task.sensor?.id
    case 'processing':
      return task.processing?.identifier
    case 'harvest':
      return task.harvest?.identifier
    default:
      return task.entityId
  }
}
