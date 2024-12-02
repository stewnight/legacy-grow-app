import type { Meta, StoryObj } from '@storybook/react'
import { MonthView } from './month-view'
import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns'

const meta = {
  title: 'Calendar/MonthView',
  component: MonthView,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MonthView>

export default meta
type Story = StoryObj<typeof meta>

const currentDate = new Date(2023, 11, 1) // December 2023
const start = startOfMonth(currentDate)
const end = endOfMonth(currentDate)
const firstDay = startOfWeek(start, { weekStartsOn: 1 })
const lastDay = endOfWeek(end, { weekStartsOn: 1 })
const days = eachDayOfInterval({ start: firstDay, end: lastDay })

const mockJobs = [
  {
    id: '1',
    title: 'Important Task',
    dueDate: new Date(2023, 11, 5),
    jobStatus: 'in_progress',
    priority: 'high',
    category: 'Development',
  },
  {
    id: '2',
    title: 'Regular Meeting',
    dueDate: new Date(2023, 11, 5),
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

export const Default: Story = {
  args: {
    currentDate,
    days,
    jobs: mockJobs,
  },
}

export const Empty: Story = {
  args: {
    currentDate,
    days,
    jobs: [],
  },
}
