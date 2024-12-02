import type { Meta, StoryObj } from '@storybook/react'
import { PeriodView } from './period-view'
import {
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addWeeks,
  addDays,
} from 'date-fns'

const meta = {
  title: 'Calendar/PeriodView',
  component: PeriodView,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PeriodView>

export default meta
type Story = StoryObj<typeof meta>

const currentDate = new Date(2023, 11, 1) // December 2023

const getWeekPeriods = (date: Date, surroundingPeriods: number) => {
  const periods = []
  for (let i = -surroundingPeriods; i <= surroundingPeriods; i++) {
    const weekStart = startOfWeek(addWeeks(date, i), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(addWeeks(date, i), { weekStartsOn: 1 })
    periods.push(eachDayOfInterval({ start: weekStart, end: weekEnd }))
  }
  return periods
}

const getDayPeriods = (date: Date, surroundingPeriods: number) => {
  const periods = []
  for (let i = -surroundingPeriods; i <= surroundingPeriods; i++) {
    periods.push([addDays(date, i)])
  }
  return periods
}

const mockJobs = [
  {
    id: '1',
    title: 'Important Task',
    dueDate: new Date(2023, 11, 1),
    jobStatus: 'in_progress',
    priority: 'high',
    category: 'Development',
  },
  {
    id: '2',
    title: 'Regular Meeting',
    dueDate: new Date(2023, 11, 8),
    jobStatus: 'completed',
    priority: 'medium',
    category: 'Meeting',
  },
  {
    id: '3',
    title: 'Project Review',
    dueDate: new Date(2023, 11, 15),
    jobStatus: 'blocked',
    priority: 'critical',
    category: 'Review',
  },
]

export const WeekView: Story = {
  args: {
    mode: 'week',
    periods: getWeekPeriods(currentDate, 1),
    jobs: mockJobs,
    currentPeriodIndex: 1,
  },
}

export const DayView: Story = {
  args: {
    mode: 'day',
    periods: getDayPeriods(currentDate, 1),
    jobs: mockJobs,
    currentPeriodIndex: 1,
  },
}

export const Empty: Story = {
  args: {
    mode: 'week',
    periods: getWeekPeriods(currentDate, 1),
    jobs: [],
    currentPeriodIndex: 1,
  },
}
