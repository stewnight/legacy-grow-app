import * as React from 'react'
import { format, isSameDay } from 'date-fns'
import { cn } from '~/lib/utils'
import { type JobWithRelations } from '~/server/db/schema'
import { JobCard } from '../job-card'

interface PeriodViewProps {
  mode: 'week' | 'day'
  periods: Date[][]
  jobs: JobWithRelations[]
  currentPeriodIndex: number
}

export function PeriodView({ mode, periods, jobs, currentPeriodIndex }: PeriodViewProps) {
  // Calculate grid columns based on number of periods
  const gridCols = React.useMemo(() => {
    switch (periods.length) {
      case 1:
        return 'grid-cols-1'
      case 3:
        return 'grid-cols-1 md:grid-cols-3'
      case 5:
        return 'grid-cols-1 md:grid-cols-3 xl:grid-cols-5'
      default:
        return 'grid-cols-1'
    }
  }, [periods.length])

  return (
    <div className={cn('grid min-w-[900px] gap-4 p-3', gridCols)}>
      {periods.map((periodDays: Date[], periodIndex: number) => {
        // Ensure periodDays[0] exists for the header
        const periodStart = periodDays[0]
        const periodEnd = periodDays[periodDays.length - 1]
        if (!periodStart) return null

        // Get jobs for this period
        const periodJobs = jobs.filter((job) => {
          if (!job.dueDate) return false
          const dueDate = new Date(job.dueDate)
          return periodDays.some((day: Date) => isSameDay(dueDate, day))
        })

        const isCurrentPeriod = periodIndex === currentPeriodIndex

        return (
          <div
            key={periodIndex}
            className={cn(
              'space-y-2 rounded-lg border transition-all duration-200',
              isCurrentPeriod
                ? 'border-accent bg-accent/5 shadow-sm'
                : 'border-border hover:border-accent/50',
              periodIndex < currentPeriodIndex && 'opacity-60',
              periodIndex > currentPeriodIndex && 'opacity-75'
            )}
          >
            <div
              className={cn(
                'sticky top-0 border-b bg-background p-2 text-center text-sm font-medium',
                isCurrentPeriod ? 'border-accent/20' : 'border-border'
              )}
            >
              {mode === 'week' && periodEnd
                ? `${format(periodStart, 'MMM d')} - ${format(periodEnd, 'MMM d')}`
                : format(periodStart, 'EEE, MMM d')}
            </div>
            <div className="space-y-1 p-2">
              {periodJobs.map((job) => (
                <div
                  key={job.id}
                  className={cn(
                    'transition-all duration-200',
                    !isCurrentPeriod && 'hover:translate-x-1 hover:opacity-100 hover:shadow-sm'
                  )}
                >
                  <JobCard key={job.id} job={job} />
                </div>
              ))}
              {periodJobs.length === 0 && (
                <div className="py-2 text-center text-sm text-muted-foreground">No tasks</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
