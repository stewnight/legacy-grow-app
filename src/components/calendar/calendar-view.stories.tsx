import type { Meta, StoryObj } from '@storybook/react'
import { CalendarView } from './calendar-view'
import { type JobWithRelations } from '~/server/db/schema'

const meta = {
  title: 'Components/CalendarView',
  component: CalendarView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CalendarView>

export default meta
type Story = StoryObj<typeof CalendarView>

const mockJobs: Partial<JobWithRelations>[] = [
  {
    id: '1',
    title: 'High Priority Task',
    priority: 'high',
    jobStatus: 'pending',
    category: 'maintenance',
    dueDate: new Date(),
  },
  {
    id: '2',
    title: 'Medium Priority Task',
    priority: 'medium',
    jobStatus: 'in_progress',
    category: 'feeding',
    dueDate: new Date(),
  },
  {
    id: '3',
    title: 'Low Priority Task',
    priority: 'low',
    jobStatus: 'completed',
    category: 'cleaning',
    dueDate: new Date(),
  },
  {
    id: '4',
    title: 'Critical Task',
    priority: 'critical',
    jobStatus: 'blocked',
    category: 'environmental',
    dueDate: new Date(),
  },
]

// Mock the API response
const mockApi = {
  job: {
    getAll: {
      useQuery: () => ({
        data: { items: mockJobs },
        isLoading: false,
      }),
    },
  },
}

// Override the real API with our mock
jest.mock('~/trpc/react', () => ({
  api: mockApi,
}))

export const Default: Story = {
  render: () => {
    return (
      <div className="w-[1000px]">
        <CalendarView
          onEventClick={(job) => {
            console.log('Job clicked:', job)
          }}
        />
      </div>
    )
  },
}

export const WithEntityFilter: Story = {
  render: () => {
    return (
      <div className="w-[1000px]">
        <CalendarView
          entityType="batch"
          entityId="123"
          onEventClick={(job) => {
            console.log('Job clicked:', job)
          }}
        />
      </div>
    )
  },
}

export const DayView: Story = {
  render: () => {
    return (
      <div className="w-[1000px]">
        <CalendarView mode="day" />
      </div>
    )
  },
}

export const WeekView: Story = {
  render: () => {
    return (
      <div className="w-[1000px]">
        <CalendarView mode="week" />
      </div>
    )
  },
}

export const Empty: Story = {
  render: () => {
    // Override mock to return no jobs
    const emptyApi = {
      ...mockApi,
      job: {
        getAll: {
          useQuery: () => ({
            data: { items: [] },
            isLoading: false,
          }),
        },
      },
    }

    jest.mock('~/trpc/react', () => ({
      api: emptyApi,
    }))

    return (
      <div className="w-[1000px]">
        <CalendarView />
      </div>
    )
  },
}
