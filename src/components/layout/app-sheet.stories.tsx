import type { Meta, StoryObj } from '@storybook/react'
import { AppSheet } from './app-sheet'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const meta = {
  title: 'Layout/AppSheet',
  component: AppSheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AppSheet>

export default meta
type Story = StoryObj<typeof AppSheet>

const ExampleForm = () => (
  <div className="grid gap-4 py-4">
    <div className="grid gap-2">
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Enter name" />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="description">Description</Label>
      <Input id="description" placeholder="Enter description" />
    </div>
  </div>
)

export const Create: Story = {
  args: {
    mode: 'create',
    entity: 'plant',
    trigger: <Button>Create Plant</Button>,
    children: <ExampleForm />,
  },
}

export const Edit: Story = {
  args: {
    mode: 'edit',
    entity: 'plant',
    trigger: <Button variant="outline">Edit Plant</Button>,
    children: <ExampleForm />,
  },
}
