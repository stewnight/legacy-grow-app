'use client';

import * as React from 'react';
import { api } from '~/trpc/react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Skeleton } from '~/components/ui/skeleton';
import Link from 'next/link';
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
  PlayCircle,
  GripVertical,
} from 'lucide-react';
import { AppSheet } from '../../../../components/layout/app-sheet';
import { JobForm } from '../_components/jobs-form';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Job, type JobWithRelations } from '~/server/db/schema/jobs';
import { type Location } from '~/server/db/schema/locations';
import { type Plant } from '~/server/db/schema/plants';
import { type Batch } from '~/server/db/schema/batches';
import { type Genetic } from '~/server/db/schema/genetics';
import { type Sensor } from '~/server/db/schema/sensors';
import { type Processing } from '~/server/db/schema/processing';
import { type Harvest } from '~/server/db/schema/harvests';
import { TaskManager } from '../_components/task-manager';
import { RecurringSettings } from '../_components/recurring-settings';
import { InstructionsManager } from '../_components/instructions-manager';
import { RequirementsManager } from '../_components/requirements-manager';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../../lib/utils';
import { NotesManager } from '../_components/notes-manager';

interface SortableTaskItemProps {
  id: string;
  task: {
    item: string;
    completed: boolean;
    completedAt?: string | null;
    estimatedMinutes?: number | null;
    actualMinutes?: number | null;
    startedAt?: string | null;
  };
  onToggle: () => void;
  onStart: () => void;
  onComplete: () => void;
}

function SortableTaskItem({ id, task, onToggle, onStart, onComplete }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50',
        isDragging && 'opacity-50'
      )}
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <Checkbox checked={task.completed} onCheckedChange={onToggle} />
        <div className="space-y-1">
          <p
            className={`font-medium ${task.completed ? 'text-muted-foreground line-through' : ''}`}
          >
            {task.item}
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {task.estimatedMinutes && (
              <div className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                <span>Est: {formatDuration(task.estimatedMinutes)}</span>
              </div>
            )}
            {task.actualMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Actual: {formatDuration(task.actualMinutes)}</span>
              </div>
            )}
            {task.completed ? (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>Completed {format(new Date(task.completedAt || ''), 'PPpp')}</span>
              </div>
            ) : task.startedAt ? (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 animate-pulse text-blue-500" />
                <span>Started {format(new Date(task.startedAt || ''), 'PPpp')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Pending</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!task.completed && !task.startedAt && (
          <Button variant="ghost" size="sm" onClick={onStart}>
            <PlayCircle className="h-4 w-4 text-blue-500" />
          </Button>
        )}
        {!task.completed && task.startedAt && (
          <Button variant="ghost" size="sm" onClick={onComplete}>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </Button>
        )}
        <Badge
          variant={task.completed ? 'default' : 'secondary'}
          className={`capitalize ${task.completed ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : task.startedAt ? 'bg-blue-500/10 text-blue-500' : ''}`}
        >
          {task.completed ? 'Done' : task.startedAt ? 'In Progress' : 'Pending'}
        </Badge>
      </div>
    </div>
  );
}

export default function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);

  const pointerSensor = useSensor(PointerSensor);
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const sensors = useSensors(pointerSensor, keyboardSensor);

  const { data: job, isLoading } = api.job.get.useQuery(resolvedParams.id, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const utils = api.useUtils();
  const [showTaskManager, setShowTaskManager] = React.useState(false);

  const { mutate: updateJobStatus } = api.job.update.useMutation({
    onSuccess: () => {
      void utils.job.get.invalidate(resolvedParams.id);
    },
  });

  const { mutate: updateJobTasks } = api.job.update.useMutation({
    onSuccess: () => {
      void utils.job.get.invalidate(resolvedParams.id);
    },
  });

  const formatDate = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    return format(new Date(date), 'PP');
  };

  const handleStatusChange = React.useCallback(
    (newStatus: 'completed' | 'pending' | 'in_progress') => {
      if (job) {
        updateJobStatus({
          id: job.id,
          data: {
            jobStatus: newStatus,
            completedAt: newStatus === 'completed' ? new Date() : null,
          },
        });
      }
    },
    [job, updateJobStatus]
  );

  const handleTaskToggle = React.useCallback(
    (index: number) => {
      if (job?.properties?.tasks) {
        const tasks = [...job.properties.tasks];
        const item = tasks[index];
        if (item) {
          tasks[index] = {
            ...item,
            completed: !item.completed,
            completedAt: !item.completed ? new Date().toISOString() : null,
          };

          updateJobTasks({
            id: job.id,
            data: {
              properties: {
                ...job.properties,
                tasks,
              },
            },
          });
        }
      }
    },
    [job, updateJobTasks]
  );

  const handleTaskStart = React.useCallback(
    (index: number) => {
      if (job?.properties?.tasks) {
        const tasks = [...job.properties.tasks];
        const item = tasks[index];
        if (item) {
          tasks[index] = {
            ...item,
            startedAt: new Date().toISOString(),
          };

          updateJobTasks({
            id: job.id,
            data: {
              properties: {
                ...job.properties,
                tasks,
              },
            },
          });
        }
      }
    },
    [job, updateJobTasks]
  );

  const handleTaskComplete = React.useCallback(
    (index: number) => {
      if (job?.properties?.tasks) {
        const tasks = [...job.properties.tasks];
        const item = tasks[index];
        if (item) {
          const now = new Date();
          const startTime = item.startedAt ? new Date(item.startedAt) : now;
          const actualMinutes = Math.round((now.getTime() - startTime.getTime()) / 60000);

          tasks[index] = {
            ...item,
            completed: true,
            completedAt: now.toISOString(),
            actualMinutes: actualMinutes,
          };

          updateJobTasks({
            id: job.id,
            data: {
              properties: {
                ...job.properties,
                tasks,
              },
            },
          });
        }
      }
    },
    [job, updateJobTasks]
  );

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    );
  }

  if (!job) {
    return notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
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
                  Type: {job.entityType.charAt(0).toUpperCase() + job.entityType.slice(1)}
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
                    <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                    <dd className="text-sm">{job.description || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Assigned To</dt>
                    <dd className="text-sm">{job.assignedTo?.name || 'Unassigned'}</dd>
                  </div>
                  {job.entityType && job.entityId && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Related To</dt>
                      <dd className="flex items-center gap-2 text-sm">
                        <LinkIcon className="h-4 w-4" />
                        <Link
                          href={`/${job.entityType}s/${job.entityId}`}
                          className="hover:underline"
                        >
                          {job.entityType.charAt(0).toUpperCase() + job.entityType.slice(1)}
                        </Link>
                      </dd>
                    </div>
                  )}
                  {job.startedAt && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Started</dt>
                      <dd className="text-sm">{formatDate(job.startedAt)}</dd>
                    </div>
                  )}
                  {job.completedAt && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Completed</dt>
                      <dd className="text-sm">{formatDate(job.completedAt)}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Estimated Duration
                    </dt>
                    <dd className="text-sm">
                      {job.metadata?.estimatedDuration
                        ? formatDuration(job.metadata.estimatedDuration)
                        : 'Not set'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Actual Duration</dt>
                    <dd className="text-sm">
                      {job.metadata?.actualDuration
                        ? formatDuration(job.metadata.actualDuration)
                        : 'Not recorded'}
                    </dd>
                  </div>
                  {job.metadata?.location && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Location Details
                      </dt>
                      <dd className="text-sm">
                        <div className="rounded-md border p-2">
                          <p>Name: {job.metadata.location.name}</p>
                          <p>Type: {job.metadata.location.type}</p>
                        </div>
                      </dd>
                    </div>
                  )}
                  {job.metadata?.previousJobs && job.metadata.previousJobs.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Previous Jobs</dt>
                      <dd className="text-sm">
                        <div className="flex flex-wrap gap-2">
                          {job.metadata.previousJobs.map((jobId) => (
                            <Link
                              key={jobId}
                              href={`/jobs/${jobId}`}
                              className="rounded-full bg-secondary px-2 py-1 text-xs hover:bg-secondary/80"
                            >
                              {jobId}
                            </Link>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                  {job.metadata?.nextJobs && job.metadata.nextJobs.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Next Jobs</dt>
                      <dd className="text-sm">
                        <div className="flex flex-wrap gap-2">
                          {job.metadata.nextJobs.map((jobId) => (
                            <Link
                              key={jobId}
                              href={`/jobs/${jobId}`}
                              className="rounded-full bg-secondary px-2 py-1 text-xs hover:bg-secondary/80"
                            >
                              {jobId}
                            </Link>
                          ))}
                        </div>
                      </dd>
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
                      <dt className="text-sm font-medium text-muted-foreground">Frequency</dt>
                      <dd className="text-sm capitalize">
                        {job.properties.recurring.frequency} (Every{' '}
                        {job.properties.recurring.interval}{' '}
                        {job.properties.recurring.frequency.slice(0, -2)})
                      </dd>
                    </div>
                    {job.properties.recurring.endDate && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
                        <dd className="text-sm">{formatDate(job.properties.recurring.endDate)}</dd>
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
                        const updatedTasks = job.properties.tasks.map((task) => ({
                          ...task,
                          completed: true,
                          completedAt: task.completed ? task.completedAt : new Date().toISOString(),
                        }));
                        updateJobTasks({
                          id: job.id,
                          data: {
                            properties: JSON.parse(
                              JSON.stringify({
                                ...job.properties,
                                tasks: updatedTasks,
                              })
                            ),
                          },
                        });
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
                        const updatedTasks = job.properties.tasks.map((task) => ({
                          ...task,
                          completed: false,
                          completedAt: null,
                        }));
                        updateJobTasks({
                          id: job.id,
                          data: {
                            properties: {
                              ...job.properties,
                              tasks: updatedTasks,
                            },
                          },
                        });
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
                      });
                    }}
                  />
                </div>
              )}

              <div className="space-y-4">
                {job.properties?.tasks && job.properties.tasks.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => {
                      const { active, over } = event;
                      if (over && active.id !== over.id) {
                        const oldIndex = job.properties!.tasks.findIndex(
                          (task) => `task-${task.item}` === active.id
                        );
                        const newIndex = job.properties!.tasks.findIndex(
                          (task) => `task-${task.item}` === over.id
                        );

                        const updatedTasks = arrayMove(job.properties!.tasks, oldIndex, newIndex);

                        updateJobTasks({
                          id: job.id,
                          data: {
                            properties: {
                              ...job.properties,
                              tasks: updatedTasks,
                            },
                          },
                        });
                      }
                    }}
                  >
                    <SortableContext
                      items={job.properties.tasks.map((task) => `task-${task.item}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {job.properties.tasks.map((task, index) => (
                          <SortableTaskItem
                            key={`task-${task.item}`}
                            id={`task-${task.item}`}
                            task={task}
                            onToggle={() => handleTaskToggle(index)}
                            onStart={() => handleTaskStart(index)}
                            onComplete={() => handleTaskComplete(index)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
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
          <Card>
            <CardHeader>
              <CardTitle>Job Requirements</CardTitle>
              <CardDescription>Tools, supplies, and PPE needed for this job</CardDescription>
            </CardHeader>
            <CardContent>
              <RequirementsManager
                value={
                  job.properties?.requirements || {
                    tools: [],
                    supplies: [],
                    ppe: [],
                  }
                }
                onChange={(requirements) => {
                  updateJobTasks({
                    id: job.id,
                    data: {
                      properties: {
                        ...job.properties,
                        requirements,
                      },
                    },
                  });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Add notes and comments to this job</CardDescription>
            </CardHeader>
            <CardContent>
              <NotesManager jobId={job.id} notes={job.notes ?? []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle>Job Instructions</CardTitle>
              <CardDescription>Step-by-step instructions for completing this job</CardDescription>
            </CardHeader>
            <CardContent>
              <InstructionsManager
                value={job.properties?.instructions || []}
                onChange={(instructions) => {
                  updateJobTasks({
                    id: job.id,
                    data: {
                      properties: {
                        ...job.properties,
                        instructions,
                      },
                    },
                  });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to get entity name
function getEntityName(
  job: JobWithRelations & {
    location?: Location;
    plant?: Plant;
    batch?: Batch;
    genetic?: Genetic;
    sensor?: Sensor;
    processing?: Processing;
    harvest?: Harvest;
  }
) {
  switch (job.entityType) {
    case 'location':
      return job.location?.name;
    case 'plant':
      return job.plant?.identifier;
    case 'batch':
      return job.batch?.identifier;
    case 'genetics':
      return job.genetic?.name;
    case 'sensors':
      return job.sensor?.id;
    case 'processing':
      return job.processing?.identifier;
    case 'harvest':
      return job.harvest?.identifier;
    default:
      return job.entityId;
  }
}

const formatDuration = (minutes: number | null | undefined) => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};
