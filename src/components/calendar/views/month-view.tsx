import * as React from 'react'
import { format, isSameMonth, isToday } from 'date-fns'
import { cn } from '~/lib/utils'
import { type JobWithRelations } from '~/server/db/schema'
import { JobCard } from '../job-card'

interface MonthViewProps {
  currentDate: Date
  days: Date[]
  jobs: JobWithRelations[]
}

export function MonthView({ currentDate, days, jobs }: MonthViewProps) {
  return (
    <div className="min-w-[900px]">
      <div className="grid grid-cols-7 text-muted-foreground">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="h-8 text-xs font-medium text-center p-0.5 border-b"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-sm">
        {days.map((date) => {
          const dayJobs = jobs.filter(
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
                  !isSameMonth(date, currentDate) && 'text-muted-foreground'
                )}
              >
                {format(date, 'd')}
              </div>
              {dayJobs.length > 0 && (
                <div className="space-y-1">
                  {dayJobs.slice(0, 2).map((job) => (
                    <JobCard key={job.id} job={job} isMonthView />
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
  )
}
