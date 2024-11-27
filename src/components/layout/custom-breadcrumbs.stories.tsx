import type { Meta, StoryObj } from '@storybook/react'
import { CustomBreadcrumbs } from './custom-breadcrumbs'

const meta = {
  title: 'Layout/CustomBreadcrumbs',
  component: CustomBreadcrumbs,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/plants/123',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CustomBreadcrumbs>

export default meta
type Story = StoryObj<typeof CustomBreadcrumbs>

export const Default: Story = {}

export const DeepPath: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/buildings/456/rooms/789/plants/123',
      },
    },
  },
}

export const WithQueryParams: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/plants/123',
        query: { status: 'active' },
      },
    },
  },
}
