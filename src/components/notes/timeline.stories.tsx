import type { Meta, StoryObj } from '@storybook/react'
import { Timeline } from './__mocks__/timeline'

const meta = {
  title: 'Notes/Timeline',
  component: Timeline,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Timeline>

export default meta
type Story = StoryObj<typeof Timeline>

export const Default: Story = {
  args: {
    entityType: 'plant',
    entityId: 1,
  },
}
