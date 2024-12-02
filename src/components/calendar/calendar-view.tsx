'use client'

import * as React from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  endOfMonth,
  startOfMonth,
} from 'date-fns'
import { cn } from '~/lib/utils'
import { ScrollArea } from '~/components/ui/scroll-area'
import { api } from '~/trpc/react'
import { type JobWithRelations } from '~/server/db/schema'
import { type JobEntityType } from '~/server/db/schema/enums'
import { CalendarHeader } from './calendar-header'
import { JobCard } from './job-card'

export type CalendarViewMode = 'month' | 'week' | 'day'

interface CalendarViewProps {
  mode?: CalendarViewMode
  defaultMode?: CalendarViewMode
  entityType?: JobEntityType
  entityId?: string
  onEventClick?: (job: JobWithRelations) => void
  className?: string
}

export function CalendarView({
  mode: initialMode = 'month',
  entityType,
  entityId,
  onEventClick,
  className,
}: CalendarViewProps) {
  const [mode, setMode] = React.useState<CalendarViewMode>(initialMode)
  const [currentDate, setCurrentDate] = React.useState(new Date())

  const { data: jobsData } = api.job.getAll.useQuery(
    {
      filters: {
        entityType,
        entityId,
      },
    },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  const filteredJobs = React.useMemo(() => {
    if (!jobsData?.items) return []

    return jobsData.items.filter((job) => {
      if (!job.dueDate) return false

      const dueDate = new Date(job.dueDate)

      if (mode === 'day') {
        return (
          format(dueDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
        )
      }

      if (mode === 'week') {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 })
        const end = endOfWeek(currentDate, { weekStartsOn: 1 })
        return dueDate >= start && dueDate <= end
      }

      return (
        dueDate.getMonth() === currentDate.getMonth() &&
        dueDate.getFullYear() === currentDate.getFullYear()
      )
    }) as JobWithRelations[]
  }, [jobsData, currentDate, mode])

  const weekDays = React.useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const monthDays = React.useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const firstDay = startOfWeek(start, { weekStartsOn: 1 })
    const lastDay = endOfWeek(end, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: firstDay, end: lastDay })
  }, [currentDate])

  return (
    <div className={cn('space-y-4', className)}>
      <CalendarHeader
        mode={mode}
        onModeChange={setMode}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      <ScrollArea className="h-[calc(100vh-12rem)] rounded-md border bg-background">
        {mode === 'month' && (
          <div className="min-w-[900px] p-3">
            <div className="grid grid-cols-7 text-muted-foreground">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div
                  key={day}
                  className="h-10 text-sm font-medium text-center p-2 border-b"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 text-sm">
              {monthDays.map((date, index) => {
                const dayJobs = filteredJobs.filter(
                  (job) =>
                    job.dueDate &&
                    format(new Date(job.dueDate), 'yyyy-MM-dd') ===
                      format(date, 'yyyy-MM-dd')
                )

                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      'min-h-[8rem] p-2 border-b border-r relative',
                      !isSameMonth(date, currentDate) && 'bg-muted/50',
                      isToday(date) && 'bg-accent/5'
                    )}
                  >
                    <div
                      className={cn(
                        'text-sm font-medium text-right mb-1',
                        !isSameMonth(date, currentDate) &&
                          'text-muted-foreground'
                      )}
                    >
                      {format(date, 'd')}
                    </div>
                    {dayJobs.length > 0 && (
                      <div className="space-y-1">
                        {dayJobs.slice(0, 2).map((job) => (
                          <JobCard
                            key={job.id}
                            job={job as JobWithRelations}
                            onClick={onEventClick}
                            isMonthView
                          />
                        ))}
                        {dayJobs.length > 2 && (
                          <div className="text-xs text-muted-foreground px-2">
                            +{dayJobs.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {(mode === 'week' || mode === 'day') && (
          <div className="p-4">
            <div className="grid gap-4">
              {mode === 'week' ? (
                eachDayOfInterval({
                  start: startOfWeek(currentDate),
                  end: endOfWeek(currentDate),
                }).map((date) => (
                  <div
                    key={date.toISOString()}
                    className="border rounded-md bg-background"
                  >
                    <div className="flex items-center justify-between p-2 bg-muted border-b">
                      <div className="font-medium">{format(date, 'EEEE')}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(date, 'MMMM d')}
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {filteredJobs
                        .filter(
                          (job) =>
                            job.dueDate &&
                            format(new Date(job.dueDate), 'yyyy-MM-dd') ===
                              format(date, 'yyyy-MM-dd')
                        )
                        .map((job) => (
                          <div key={job.id} className="p-2">
                            <JobCard
                              job={job as JobWithRelations}
                              onClick={onEventClick}
                            />
                          </div>
                        ))}
                      {filteredJobs.filter(
                        (job) =>
                          job.dueDate &&
                          format(new Date(job.dueDate), 'yyyy-MM-dd') ===
                            format(date, 'yyyy-MM-dd')
                      ).length === 0 && (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          No jobs scheduled
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="border rounded-md bg-background">
                  <div className="flex items-center justify-between p-2 bg-muted border-b">
                    <div className="font-medium">
                      {format(currentDate, 'EEEE')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(currentDate, 'MMMM d, yyyy')}
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {filteredJobs.map((job) => (
                      <div key={job.id} className="p-2">
                        <JobCard
                          job={job as JobWithRelations}
                          onClick={onEventClick}
                        />
                      </div>
                    ))}
                    {filteredJobs.length === 0 && (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        No jobs scheduled
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
