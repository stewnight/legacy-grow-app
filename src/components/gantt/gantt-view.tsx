'use client'

import * as React from 'react'
import {
  format,
  isSameMonth,
  isToday as isDateToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  formatDistanceToNow,
  differenceInDays,
  isSameDay,
  isAfter,
} from 'date-fns'
import { cn } from '~/lib/utils'
import { type JobWithRelations } from '~/server/db/schema'
import { Badge } from '../ui/badge'
import { Calendar, Clock, Users, ListChecks, GripVertical } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'
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
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '../ui/resizable'
import { AppSheet } from '~/components/Layout/app-sheet'
import { JobForm } from '~/components/jobs/jobs-form'

const PAST_MONTHS = 1 // Show 1 month in the past
const FUTURE_MONTHS = 6 // Show 6 months in the future
const CELL_WIDTH = 40 // Width of each day cell in pixels
const ROW_HEIGHT = 44 // Height of each row in pixels

export function GanttView({ jobs }: { jobs: JobWithRelations[] }) {
  const timelineRef = React.useRef<HTMLDivElement>(null)
  const [sortedJobs, setSortedJobs] = React.useState<JobWithRelations[]>([])
  const updateJobMutation = api.job.update.useMutation()

  // Sort jobs by due date and dependencies
  React.useEffect(() => {
    const sorted = [...jobs].sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    setSortedJobs(sorted)
  }, [jobs])

  // Calculate the days for the timeline
  const periods = React.useMemo(() => {
    const today = new Date()
    const start = subMonths(startOfMonth(today), PAST_MONTHS)
    const end = addMonths(endOfMonth(today), FUTURE_MONTHS)
    return eachDayOfInterval({ start, end })
  }, [])

  // Center on today's date on initial render
  React.useEffect(() => {
    const scrollToToday = () => {
      if (timelineRef.current) {
        const todayIndex = periods.findIndex((date) => isDateToday(date))
        if (todayIndex !== -1) {
          const container = timelineRef.current.querySelector(
            '[data-radix-scroll-area-viewport]'
          )!
          if (container) {
            const scrollPosition =
              todayIndex * CELL_WIDTH - container.clientWidth / 2
            container.scrollLeft = scrollPosition
          }
        }
      }
    }

    // Try immediately
    scrollToToday()
    // And also after a short delay to ensure DOM is ready
    const timer = setTimeout(scrollToToday, 100)
    return () => clearTimeout(timer)
  }, [periods])

  const jumpToToday = () => {
    if (timelineRef.current) {
      const todayIndex = periods.findIndex((date) => isDateToday(date))
      if (todayIndex !== -1) {
        const container = timelineRef.current.querySelector(
          '[data-radix-scroll-area-viewport]'
        )!
        if (container) {
          const scrollPosition =
            todayIndex * CELL_WIDTH - container.clientWidth / 2
          container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth',
          })
        }
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-green-500/10'
      case 'in_progress':
        return 'bg-blue-500 text-blue-500/10'
      case 'blocked':
        return 'bg-yellow-500 text-yellow-500/10'
      case 'cancelled':
        return 'bg-destructive text-destructive/10'
      case 'deferred':
        return 'bg-violet-500 text-violet-500/10'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  const calculateProgress = (job: JobWithRelations) => {
    if (!job.properties?.tasks?.length) return 0
    const completedTasks = job.properties.tasks.filter(
      (task) => task?.completed
    )
    return (completedTasks.length / job.properties.tasks.length) * 100
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-2">
        <Button
          variant="outline"
          onClick={jumpToToday}
          size="sm"
          className="h-7"
        >
          Today
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full border-r">
              <div className="h-8" /> {/* Spacer for month label */}
              <div className="h-8 border-b" /> {/* Spacer for date numbers */}
              <ScrollArea className="h-[calc(100%-64px)]">
                {sortedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center border-b px-4 hover:bg-muted/50"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {job.description}
                      </div>
                    </div>
                    {job.assignedTo && (
                      <Avatar className="ml-2 h-6 w-6 flex-shrink-0">
                        <AvatarImage
                          src={job.assignedTo.image || ''}
                          alt={job.assignedTo.name || ''}
                        />
                        <AvatarFallback>
                          {job.assignedTo.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={75}>
            <ScrollArea className="h-full" ref={timelineRef}>
              <div className="relative">
                {/* Month labels */}
                <div className="sticky top-0 z-20 flex h-8 min-w-max bg-background">
                  {periods.map((date, index) => {
                    const isFirstDayOfMonth = date.getDate() === 1
                    return (
                      <div
                        key={date.toISOString()}
                        className="flex-none"
                        style={{ width: CELL_WIDTH }}
                      >
                        {isFirstDayOfMonth && (
                          <div className="absolute top-2 font-medium">
                            {format(date, 'MMMM yyyy')}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Day numbers */}
                <div className="sticky top-8 z-20 flex min-w-max border-y bg-background">
                  {periods.map((date) => (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        'flex h-8 flex-none items-center justify-center border-r text-sm',
                        isDateToday(date) && 'bg-orange-500/10'
                      )}
                      style={{ width: CELL_WIDTH }}
                    >
                      {date.getDate()}
                    </div>
                  ))}
                </div>

                {/* Tasks grid */}
                <div className="relative min-w-max">
                  {/* Today indicator */}
                  {periods.some((date) => isDateToday(date)) && (
                    <div
                      className="absolute bottom-0 top-0 w-px bg-orange-500"
                      style={{
                        left: `${
                          periods.findIndex((date) => isDateToday(date)) *
                            CELL_WIDTH +
                          CELL_WIDTH / 2
                        }px`,
                      }}
                    />
                  )}

                  {/* Task rows */}
                  {sortedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex border-b hover:bg-muted/50"
                      style={{ height: ROW_HEIGHT }}
                    >
                      {periods.map((date) => (
                        <div
                          key={date.toISOString()}
                          className="relative flex-none border-r"
                          style={{ width: CELL_WIDTH }}
                        >
                          {job.dueDate &&
                            isSameDay(date, new Date(job.dueDate)) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={cn(
                                        'absolute inset-2 max-h-6 rounded-full',
                                        getStatusColor(job.jobStatus)
                                      )}
                                    >
                                      <Progress
                                        value={calculateProgress(job)}
                                        className="h-full rounded-full opacity-10"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="w-72 p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                      <Link
                                        href={`/jobs/${job.id}`}
                                        className="text-sm font-medium hover:underline"
                                      >
                                        {job.title}
                                      </Link>
                                      <AppSheet
                                        mode="edit"
                                        entity="job"
                                        trigger={
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7"
                                          >
                                            Edit
                                          </Button>
                                        }
                                      >
                                        <JobForm
                                          mode="edit"
                                          initialData={job}
                                        />
                                      </AppSheet>
                                    </div>
                                    <div className="space-y-1.5">
                                      {job.assignedTo && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <Avatar className="h-5 w-5">
                                            <AvatarImage
                                              src={job.assignedTo.image || ''}
                                              alt={job.assignedTo.name || ''}
                                            />
                                            <AvatarFallback>
                                              {job.assignedTo.name?.[0] || 'U'}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span>{job.assignedTo.name}</span>
                                        </div>
                                      )}
                                      <div className="text-xs text-muted-foreground">
                                        Due{' '}
                                        {format(new Date(job.dueDate), 'PP')}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Progress:{' '}
                                        {Math.round(calculateProgress(job))}%
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
