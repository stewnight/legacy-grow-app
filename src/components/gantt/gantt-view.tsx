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
} from 'date-fns'
import { cn } from '~/lib/utils'
import { type JobWithRelations } from '~/server/db/schema'
import { Badge } from '../ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { api } from '~/trpc/react'

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
              Job Title
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
              {sortedJobs.map((job) => (
                <div key={job.id} className="grid grid-cols-[250px_1fr]">
                  {/* Fixed left column content */}
                  <div className="sticky left-0 z-10 bg-background p-2 border-r">
                    <div className="font-medium truncate">{job.title}</div>
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
                    </div>
                  </div>

                  {/* Scrollable timeline content */}
                  <div className="relative group">
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
                      {job.dueDate && (
                        <div
                          className={cn(
                            'absolute top-1/2 -translate-y-1/2 h-4 rounded-full mx-2 group-hover:h-6 transition-all cursor-move',
                            getStatusColor(job.jobStatus)
                          )}
                          style={{
                            left: '0',
                            width: '100%',
                            backgroundImage: `linear-gradient(90deg, 
                              ${job.jobStatus === 'completed' ? 'rgb(34 197 94 / 0.2)' : 'rgb(59 130 246 / 0.2)'} ${calculateProgress(job)}%, 
                              transparent ${calculateProgress(job)}%
                            )`,
                          }}
                        />
                      )}
                      {renderDependencyLines(job)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DndContext>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}
