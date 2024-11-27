import type { Meta, StoryObj } from '@storybook/react'

import { NavUser } from './nav-user'

const meta = {
  component: NavUser,
} satisfies Meta<typeof NavUser>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    user: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      image: 'https://github.com/shadcn.png',
    },
  },
}
