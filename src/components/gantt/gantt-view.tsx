'use client'

import * as React from 'react'
import {
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  addWeeks,
  addQuarters,
  formatDistanceToNow,
  differenceInDays,
  isSameDay,
  isAfter,
} from 'date-fns'
import { cn } from '~/lib/utils'
import { type JobWithRelations } from '~/server/db/schema'
import { Badge } from '../ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  ListChecks,
} from 'lucide-react'
import { Button } from '../ui/button'
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { api } from '~/trpc/react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Progress } from '../ui/progress'
import Link from 'next/link'

type ZoomLevel = 'day' | 'week' | 'month' | 'quarter'

interface GanttViewProps {
  jobs: JobWithRelations[]
}

export function GanttView({ jobs }: GanttViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [sortedJobs, setSortedJobs] = React.useState<JobWithRelations[]>([])
  const [zoomLevel, setZoomLevel] = React.useState<ZoomLevel>('month')
  const updateJobMutation = api.job.update.useMutation()

  // Sort jobs by due date and dependencies
  React.useEffect(() => {
    const sorted = [...jobs].sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    setSortedJobs(sorted)
  }, [jobs])

  // Calculate the days based on zoom level
  const periods = React.useMemo(() => {
    const start = startOfMonth(currentDate)
    let end
    switch (zoomLevel) {
      case 'day':
        end = addWeeks(start, 2)
        break
      case 'week':
        end = addMonths(start, 1)
        break
      case 'month':
        end = endOfMonth(start)
        break
      case 'quarter':
        end = addQuarters(start, 1)
        break
    }
    return eachDayOfInterval({ start, end })
  }, [currentDate, zoomLevel])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const jobId = active.id as string
    const date = over.id as string
    const job = jobs.find((j) => j.id === jobId)

    if (job) {
      updateJobMutation.mutate({
        id: jobId,
        data: {
          dueDate: new Date(date),
        },
      })
    }
  }

  const nextPeriod = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      switch (zoomLevel) {
        case 'day':
          next.setDate(next.getDate() + 14)
          break
        case 'week':
          next.setMonth(next.getMonth() + 1)
          break
        case 'month':
          next.setMonth(next.getMonth() + 1)
          break
        case 'quarter':
          next.setMonth(next.getMonth() + 3)
          break
      }
      return next
    })
  }

  const previousPeriod = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      switch (zoomLevel) {
        case 'day':
          next.setDate(next.getDate() - 14)
          break
        case 'week':
          next.setMonth(next.getMonth() - 1)
          break
        case 'month':
          next.setMonth(next.getMonth() - 1)
          break
        case 'quarter':
          next.setMonth(next.getMonth() - 3)
          break
      }
      return next
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500'
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500'
      case 'blocked':
        return 'bg-destructive/10 text-destructive'
      default:
        return 'bg-secondary/10 text-secondary-foreground'
    }
  }

  const calculateProgress = (job: JobWithRelations) => {
    if (!job.properties?.tasks?.length) return 0
    const completedTasks = job.properties.tasks.filter((task) => task.completed)
    return (completedTasks.length / job.properties.tasks.length) * 100
  }

  const renderDependencyLines = (job: JobWithRelations) => {
    if (!job.metadata?.previousJobs?.length) return null

    return job.metadata.previousJobs.map((prevJobId) => {
      const prevJob = jobs.find((j) => j.id === prevJobId)
      if (!prevJob || !prevJob.dueDate || !job.dueDate) return null

      const startDate = new Date(prevJob.dueDate)
      const endDate = new Date(job.dueDate)

      return (
        <svg
          key={`${prevJobId}-${job.id}`}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <path
            d={`M ${startDate} 50% L ${endDate} 50%`}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4"
            className="text-muted-foreground/50"
          />
        </svg>
      )
    })
  }

  const timelineWidth = `${periods.length * 40}px`

  const getJobDuration = (job: JobWithRelations) => {
    if (!job.dueDate || !job.startedAt) return null
    return differenceInDays(new Date(job.dueDate), new Date(job.startedAt))
  }

  const getCompletedTaskCount = (job: JobWithRelations) => {
    if (!job.properties?.tasks) return { completed: 0, total: 0 }
    const completed = job.properties.tasks.filter(
      (task) => task.completed
    ).length
    return { completed, total: job.properties.tasks.length }
  }

  const getTimeStatus = (job: JobWithRelations) => {
    if (!job.dueDate) return null
    const dueDate = new Date(job.dueDate)
    const today = new Date()

    if (job.jobStatus === 'completed') return 'Completed'
    if (dueDate < today) return 'Overdue'
    if (differenceInDays(dueDate, today) <= 7) return 'Due soon'
    return 'On track'
  }

  const renderJobTooltip = (job: JobWithRelations) => {
    const taskCount = getCompletedTaskCount(job)
    const timeStatus = getTimeStatus(job)
    const duration = getJobDuration(job)

    return (
      <div className="space-y-2 p-2 max-w-xs">
        <div className="font-medium">{job.title}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                Due{' '}
                {formatDistanceToNow(new Date(job.dueDate || ''), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{duration ? `${duration} days` : 'No duration set'}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <ListChecks className="h-3 w-3" />
              <span>
                {taskCount.completed}/{taskCount.total} tasks
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <Badge
              variant="secondary"
              className={cn(
                'text-xs w-full justify-center',
                timeStatus === 'Overdue' &&
                  'bg-destructive/10 text-destructive',
                timeStatus === 'Due soon' && 'bg-yellow-500/10 text-yellow-500',
                timeStatus === 'Completed' && 'bg-green-500/10 text-green-500',
                timeStatus === 'On track' && 'bg-blue-500/10 text-blue-500'
              )}
            >
              {timeStatus}
            </Badge>
            <Progress
              value={calculateProgress(job)}
              className="h-1.5"
              indicatorClassName={cn(
                job.jobStatus === 'completed' && 'bg-green-500',
                job.jobStatus === 'in_progress' && 'bg-blue-500'
              )}
            />
            {job.assignedTo && (
              <div className="flex items-center gap-1 justify-end">
                <span className="text-xs text-muted-foreground">
                  Assigned to
                </span>
                <Avatar className="h-4 w-4">
                  <AvatarImage src={job.assignedTo.image || ''} />
                  <AvatarFallback>
                    {job.assignedTo.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
        {job.properties?.requirements && (
          <div className="text-xs text-muted-foreground pt-1 border-t">
            <div className="flex flex-wrap gap-1">
              {job.properties.requirements.tools.map((tool) => (
                <Badge key={tool} variant="outline" className="text-[10px]">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const getTaskPosition = (date: Date | null | undefined, periods: Date[]) => {
    if (!date) return null
    const taskDate = new Date(date)
    const dayIndex = periods.findIndex((day) => isSameDay(day, taskDate))
    if (dayIndex === -1) return null
    return dayIndex * 40 // 40px is our column width
  }

  const getTaskWidth = (
    job: JobWithRelations,
    taskPosition: number | null,
    periods: Date[]
  ) => {
    if (!job.dueDate || taskPosition === null) return 8 // Default width for non-overdue tasks

    const dueDate = new Date(job.dueDate)
    const today = new Date()

    // If the job is not overdue or is completed, return standard width
    if (job.jobStatus === 'completed' || !isAfter(today, dueDate)) {
      return 8
    }

    // For overdue tasks, calculate width from due date to today
    const todayIndex = periods.findIndex((day) => isSameDay(day, today))
    if (todayIndex === -1) return 8

    const taskIndex = taskPosition / 40 // Convert position back to index
    const width = (todayIndex - taskIndex + 1) * 40 // +1 to include the due date
    return Math.max(width, 8) // Ensure minimum width
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousPeriod}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <Button variant="outline" size="icon" onClick={nextPeriod}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomLevel('day')}
            className={cn(zoomLevel === 'day' && 'bg-accent')}
          >
            Day
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomLevel('week')}
            className={cn(zoomLevel === 'week' && 'bg-accent')}
          >
            Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomLevel('month')}
            className={cn(zoomLevel === 'month' && 'bg-accent')}
          >
            Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomLevel('quarter')}
            className={cn(zoomLevel === 'quarter' && 'bg-accent')}
          >
            Quarter
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <ScrollArea className="w-full">
          <div className="grid grid-cols-[250px_1fr]">
            {/* Fixed left column headers */}
            <div className="sticky left-0 z-10 bg-background p-2 font-medium text-muted-foreground border-r">
              <div className="flex items-center justify-between">
                <span>Job Title</span>
                <span className="text-xs">({sortedJobs.length})</span>
              </div>
            </div>

            {/* Scrollable date headers */}
            <div
              className="inline-flex border-l min-w-full"
              style={{ width: timelineWidth }}
            >
              {periods.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'w-10 text-center text-sm py-2 font-medium border-r shrink-0',
                    isToday(day) && 'bg-accent/5',
                    !isSameMonth(day, currentDate) && 'text-muted-foreground'
                  )}
                >
                  {format(
                    day,
                    zoomLevel === 'day'
                      ? 'd'
                      : zoomLevel === 'week'
                        ? 'w'
                        : zoomLevel === 'month'
                          ? 'd'
                          : 'MMM'
                  )}
                </div>
              ))}
            </div>
          </div>

          <DndContext onDragEnd={handleDragEnd}>
            <div className="divide-y">
              {sortedJobs.map((job) => {
                const taskPosition = getTaskPosition(job.dueDate, periods)
                const taskWidth = getTaskWidth(job, taskPosition, periods)
                const isJobOverdue = getTimeStatus(job) === 'Overdue'

                return (
                  <div
                    key={job.id}
                    className="grid grid-cols-[250px_1fr] hover:bg-muted/50"
                  >
                    {/* Fixed left column content */}
                    <div className="sticky left-0 z-10 bg-background p-2 border-r">
                      <div className="flex items-center justify-between">
                        <div className="font-medium truncate">
                          <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                        </div>
                        {job.assignedTo && (
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={job.assignedTo.image || ''} />
                            <AvatarFallback>
                              {job.assignedTo.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs capitalize',
                            getStatusColor(job.jobStatus)
                          )}
                        >
                          {job.jobStatus}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {job.priority}
                        </Badge>
                        {getTimeStatus(job) === 'Overdue' && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Scrollable timeline content */}
                    <div className="relative group min-h-[4rem]">
                      <div
                        className="inline-flex relative border-l min-w-full"
                        style={{ width: timelineWidth }}
                      >
                        {periods.map((day) => (
                          <div
                            key={day.toISOString()}
                            className={cn(
                              'w-10 border-r h-full shrink-0',
                              isToday(day) && 'bg-accent/5',
                              !isSameMonth(day, currentDate) && 'bg-muted/50'
                            )}
                          />
                        ))}
                        {taskPosition !== null && job.dueDate && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div
                                  className={cn(
                                    'absolute top-1/2 -translate-y-1/2 h-4 rounded-full transition-all cursor-move group-hover:h-6',
                                    isJobOverdue
                                      ? 'bg-destructive/10'
                                      : getStatusColor(job.jobStatus)
                                  )}
                                  style={{
                                    left: `${taskPosition}px`,
                                    width: `${taskWidth}px`,
                                  }}
                                >
                                  <div
                                    className={cn(
                                      'h-full rounded-full',
                                      isJobOverdue && 'bg-destructive/20'
                                    )}
                                    style={{
                                      width: `${calculateProgress(job)}%`,
                                      background: !isJobOverdue
                                        ? job.jobStatus === 'completed'
                                          ? 'rgb(34 197 94 / 0.2)'
                                          : 'rgb(59 130 246 / 0.2)'
                                        : undefined,
                                    }}
                                  />
                                  {isJobOverdue && (
                                    <div
                                      className="absolute inset-0 bg-destructive/10"
                                      style={{
                                        backgroundImage:
                                          'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px)',
                                      }}
                                    />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {renderJobTooltip(job)}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {renderDependencyLines(job)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </DndContext>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}
