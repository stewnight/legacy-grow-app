import type { Meta, StoryObj } from '@storybook/react'
import { QuickActions } from './quick-actions'

const meta = {
  title: 'Dashboard/QuickActions',
  component: QuickActions,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[240px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuickActions>

export default meta
type Story = StoryObj<typeof QuickActions>

export const Default: Story = {}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}
