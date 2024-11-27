import type { Meta, StoryObj } from '@storybook/react'
import { AppSidebar } from './app-sidebar'

const meta: Meta<typeof AppSidebar> = {
  title: 'Layout/AppSidebar',
  component: AppSidebar,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof AppSidebar>

export const Default: Story = {
  args: {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://github.com/shadcn.png',
    },
  },
}

export const Mobile: Story = {
  ...Default,
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}
