import type { Meta, StoryObj } from '@storybook/react'
import { Calendar } from './calendar'
import { useState } from 'react'
import { type DateRange } from 'react-day-picker'

const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof Calendar>

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    )
  },
}

export const WithInitialDate: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date('2024-03-15'))
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    )
  },
}

export const WithDateRange: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(2024, 2, 15),
      to: new Date(2024, 2, 20),
    })
    return (
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        className="rounded-md border"
        numberOfMonths={2}
      />
    )
  },
}
