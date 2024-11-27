import type { Meta, StoryObj } from '@storybook/react'
import RootLayout from './layout'

const meta = {
  title: 'App/RootLayout',
  component: RootLayout,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen font-geist-sans">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RootLayout>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: <div>Page Content</div>,
  },
}

export const Authenticated: Story = {
  args: {
    children: <div>Authenticated Content</div>,
  },
  parameters: {
    nextjs: {
      auth: {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          image: 'https://github.com/shadcn.png',
        },
      },
    },
  },
}
