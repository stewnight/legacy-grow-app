'use client'

import * as React from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  endOfMonth,
  startOfMonth,
  addWeeks,
  addDays,
} from 'date-fns'
import { ScrollArea } from '~/components/ui/scroll-area'
import { api } from '~/trpc/react'
import { CalendarHeader } from './calendar-header'
import { MonthView } from './views/month-view'
import { PeriodView } from './views/period-view'
import { JobWithRelations } from '../../server/db/schema'

export type CalendarViewMode = 'month' | 'week' | 'day'

interface CalendarViewProps {
  initialMode?: CalendarViewMode
}

export function CalendarView({ initialMode = 'month' }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [mode, setMode] = React.useState<CalendarViewMode>(initialMode)
  const [surroundingPeriods, setSurroundingPeriods] = React.useState<1 | 2>(1)

  const { data: jobsData } = api.job.getAll.useQuery({})

  const getSurroundingDays = React.useCallback(() => {
    const periods = []
    for (let i = -surroundingPeriods; i <= surroundingPeriods; i++) {
      if (mode === 'week') {
        const weekStart = startOfWeek(addWeeks(currentDate, i), {
          weekStartsOn: 1,
        })
        const weekEnd = endOfWeek(addWeeks(currentDate, i), { weekStartsOn: 1 })
        periods.push(eachDayOfInterval({ start: weekStart, end: weekEnd }))
      } else if (mode === 'day') {
        periods.push([addDays(currentDate, i)])
      }
    }
    return periods
  }, [mode, surroundingPeriods, currentDate])

  const monthDays = React.useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const firstDay = startOfWeek(start, { weekStartsOn: 1 })
    const lastDay = endOfWeek(end, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: firstDay, end: lastDay })
  }, [currentDate])

  const filteredJobs = React.useMemo(() => {
    if (!jobsData?.items) return []

    return jobsData.items.filter((job) => {
      if (!job.dueDate) return false
      const dueDate = new Date(job.dueDate)

      if (mode === 'month') {
        return (
          dueDate.getMonth() === currentDate.getMonth() &&
          dueDate.getFullYear() === currentDate.getFullYear()
        )
      }

      // For week and day views, show all jobs in the visible periods
      const periods = getSurroundingDays()
      const allDays = periods.flat()
      return allDays.some(
        (day) => format(dueDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      )
    })
  }, [jobsData, currentDate, mode, getSurroundingDays])

  return (
    <div className="space-y-4">
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        mode={mode}
        onModeChange={setMode}
      />
      {(mode === 'week' || mode === 'day') && (
        <div className="flex items-center justify-end gap-2 px-2">
          <span className="text-sm text-muted-foreground">
            Show surrounding:
          </span>
          <select
            className="text-sm border rounded px-2 py-1"
            value={surroundingPeriods}
            onChange={(e) =>
              setSurroundingPeriods(Number(e.target.value) as 1 | 2)
            }
          >
            <option value={1}>3 {mode}s</option>
            <option value={2}>5 {mode}s</option>
          </select>
        </div>
      )}
      <ScrollArea className="h-[calc(100vh-12rem)] rounded-md border bg-background">
        {mode === 'month' ? (
          <MonthView
            currentDate={currentDate}
            days={monthDays}
            jobs={filteredJobs as JobWithRelations[]}
          />
        ) : (
          <PeriodView
            mode={mode}
            periods={getSurroundingDays()}
            jobs={filteredJobs as JobWithRelations[]}
            currentPeriodIndex={surroundingPeriods}
          />
        )}
      </ScrollArea>
    </div>
  )
}
