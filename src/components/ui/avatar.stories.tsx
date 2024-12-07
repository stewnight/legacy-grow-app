import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof Avatar>

export const WithImage: Story = {
  args: {
    children: (
      <>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </>
    ),
  },
}

export const WithFallback: Story = {
  args: {
    children: (
      <>
        <AvatarImage src="/broken-image.jpg" alt="@johndoe" />
        <AvatarFallback>JD</AvatarFallback>
      </>
    ),
  },
}
