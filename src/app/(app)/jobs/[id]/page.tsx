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
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { AppSheet } from '../../../../components/layout/app-sheet'
import { JobForm } from '../_components/jobs-form'
import { Badge } from '../../../../components/ui/badge'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type Job, type JobWithRelations } from '~/server/db/schema/jobs'
import { type Location } from '~/server/db/schema/locations'
import { type Plant } from '~/server/db/schema/plants'
import { type Batch } from '~/server/db/schema/batches'
import { type Genetic } from '~/server/db/schema/genetics'
import { type Sensor } from '~/server/db/schema/sensors'
import { type Processing } from '~/server/db/schema/processing'
import { type Harvest } from '~/server/db/schema/harvests'
import { TaskManager } from '../_components/task-manager'

export default function JobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)

  const { data: job, isLoading } = api.job.get.useQuery(resolvedParams.id, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const utils = api.useUtils()

  const { mutate: updateJobStatus } = api.job.update.useMutation({
    onSuccess: () => {
      void utils.job.get.invalidate(resolvedParams.id)
    },
  })

  const { mutate: updateJobTasks } = api.job.update.useMutation({
    onSuccess: () => {
      void utils.job.get.invalidate(resolvedParams.id)
    },
  })

  const formatDate = (date: Date | string | null): string => {
    if (!date) return 'N/A'
    return format(new Date(date), 'PP')
  }

  const handleStatusChange = (
    newStatus: 'completed' | 'pending' | 'in_progress'
  ) => {
    if (job) {
      updateJobStatus({
        id: job.id,
        data: {
          jobStatus: newStatus,
          completedAt: newStatus === 'completed' ? new Date() : null,
        },
      })
    }
  }

  const handleTaskToggle = (index: number) => {
    if (job?.properties?.tasks) {
      const tasks = [...job.properties.tasks]
      const item = tasks[index]
      if (item) {
        tasks[index] = {
          ...item,
          completed: !item.completed,
          completedAt: !item.completed ? new Date().toISOString() : null,
        }

        updateJobTasks({
          id: job.id,
          data: {
            properties: {
              ...job.properties,
              tasks,
            },
          },
        })
      }
    }
  }

  const [showTaskManager, setShowTaskManager] = React.useState(false)

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

  if (!job) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{job.title}</h2>
          <p className="text-muted-foreground">
            Created by {job.createdBy.name} on {formatDate(job.createdAt)}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {job.jobStatus !== 'completed' && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange('completed')}
              className="w-full sm:w-auto"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          )}
          <AppSheet mode="edit" entity="job">
            <JobForm mode="edit" defaultValues={job} />
          </AppSheet>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {job.jobStatus === 'completed' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : job.jobStatus === 'pending' ? (
              <Clock className="h-4 w-4 text-yellow-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-blue-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{job.jobStatus}</div>
            <p className="text-xs text-muted-foreground">Current status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(job.dueDate)}</div>
            <p className="text-xs text-muted-foreground">Job deadline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priority</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{job.priority}</div>
            <p className="text-xs text-muted-foreground">Job priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{job.category}</div>
            <p className="text-xs text-muted-foreground">Job type</p>
          </CardContent>
        </Card>

        {job.entityType !== 'none' && job.entityId && (
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
                  {job.entityType.charAt(0).toUpperCase() +
                    job.entityType.slice(1)}
                </p>
                <Link
                  href={`/${job.entityType}s/${job.entityId}`}
                  className="text-sm text-blue-500 hover:underline"
                >
                  {getEntityName(job as JobWithRelations)}
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
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="details">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Description
                    </dt>
                    <dd className="text-sm">{job.description || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Assigned To
                    </dt>
                    <dd className="text-sm">
                      {job.assignedTo?.name || 'Unassigned'}
                    </dd>
                  </div>
                  {job.entityType && job.entityId && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Related To
                      </dt>
                      <dd className="flex items-center gap-2 text-sm">
                        <LinkIcon className="h-4 w-4" />
                        <Link
                          href={`/${job.entityType}s/${job.entityId}`}
                          className="hover:underline"
                        >
                          {job.entityType.charAt(0).toUpperCase() +
                            job.entityType.slice(1)}
                        </Link>
                      </dd>
                    </div>
                  )}
                  {job.startedAt && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Started
                      </dt>
                      <dd className="text-sm">{formatDate(job.startedAt)}</dd>
                    </div>
                  )}
                  {job.completedAt && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Completed
                      </dt>
                      <dd className="text-sm">{formatDate(job.completedAt)}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {job.properties?.recurring && (
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
                        {job.properties.recurring.frequency}
                      </dd>
                    </div>
                    {job.properties.recurring.interval && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Interval
                        </dt>
                        <dd className="text-sm">
                          Every {job.properties.recurring.interval}{' '}
                          {job.properties.recurring.frequency}
                        </dd>
                      </div>
                    )}
                    {job.properties.recurring.endDate && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          End Date
                        </dt>
                        <dd className="text-sm">
                          {formatDate(job.properties.recurring.endDate)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Job Tasks</CardTitle>
                  <CardDescription>Steps to complete this job</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTaskManager(!showTaskManager)}
                  >
                    {showTaskManager ? (
                      <>
                        <ChevronUp className="mr-2 h-4 w-4" />
                        Hide Manager
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Manage Tasks
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (job.properties?.tasks) {
                        const updatedTasks = job.properties.tasks.map(
                          (task) => ({
                            ...task,
                            completed: true,
                            completedAt: task.completed
                              ? task.completedAt
                              : new Date().toISOString(),
                          })
                        )
                        updateJobTasks({
                          id: job.id,
                          data: {
                            properties: {
                              ...job.properties,
                              tasks: updatedTasks,
                            },
                          },
                        })
                      }
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (job.properties?.tasks) {
                        const updatedTasks = job.properties.tasks.map(
                          (task) => ({
                            ...task,
                            completed: false,
                            completedAt: null,
                          })
                        )
                        updateJobTasks({
                          id: job.id,
                          data: {
                            properties: {
                              ...job.properties,
                              tasks: updatedTasks,
                            },
                          },
                        })
                      }
                    }}
                  >
                    Reset All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {showTaskManager && (
                <div className="rounded-lg border bg-card p-4">
                  <TaskManager
                    tasks={job.properties?.tasks || []}
                    onChange={(tasks) => {
                      updateJobTasks({
                        id: job.id,
                        data: {
                          properties: {
                            ...job.properties,
                            tasks,
                          },
                        },
                      })
                    }}
                  />
                </div>
              )}

              <div className="space-y-4">
                {job.properties?.tasks && job.properties.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {job.properties.tasks.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() => handleTaskToggle(index)}
                          />
                          <div>
                            <p
                              className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {item.item}
                            </p>
                            <div className="flex gap-2 items-center text-sm text-muted-foreground mt-1">
                              {item.completed ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  <span>
                                    Completed{' '}
                                    {formatDate(item.completedAt || '')}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3" />
                                  <span>Pending</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={item.completed ? 'default' : 'secondary'}
                          className={`capitalize ${item.completed ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}`}
                        >
                          {item.completed ? 'Done' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <p>No tasks added yet</p>
                    <Button
                      variant="link"
                      onClick={() => setShowTaskManager(true)}
                      className="mt-2"
                    >
                      Add your first task
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <div className="grid gap-4 md:grid-cols-3">
            {job.properties?.requirements && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {job.properties.requirements.tools?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {job.properties.requirements.tools.map((tool) => (
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
                    {job.properties.requirements.supplies?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {job.properties.requirements.supplies.map((supply) => (
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
                    {job.properties.requirements.ppe?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {job.properties.requirements.ppe.map((ppe) => (
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
  job: JobWithRelations & {
    location?: Location
    plant?: Plant
    batch?: Batch
    genetic?: Genetic
    sensor?: Sensor
    processing?: Processing
    harvest?: Harvest
  }
) {
  switch (job.entityType) {
    case 'location':
      return job.location?.name
    case 'plant':
      return job.plant?.identifier
    case 'batch':
      return job.batch?.identifier
    case 'genetics':
      return job.genetic?.name
    case 'sensors':
      return job.sensor?.id
    case 'processing':
      return job.processing?.identifier
    case 'harvest':
      return job.harvest?.identifier
    default:
      return job.entityId
  }
}
