import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from './toast'
import { Button } from './button'
import { useToast } from '~/hooks/use-toast'
import { ToastAction } from '@radix-ui/react-toast'

const meta = {
  title: 'UI/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof Toast>

export const Default: Story = {
  render: function ToastDemo() {
    const { toast } = useToast()

    return (
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: 'Scheduled: Catch up',
            description: 'Friday, February 10, 2024 at 5:57 PM',
          })
        }}
      >
        Show Toast
      </Button>
    )
  },
}

export const WithAction: Story = {
  render: function ToastDemo() {
    const { toast } = useToast()

    return (
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: 'Undo Changes?',
            description: 'Your changes will be lost if you continue.',
            action: (
              <ToastAction
                altText="Undo changes"
                onClick={() => console.log('Undo')}
              >
                Undo
              </ToastAction>
            ),
          })
        }}
      >
        Show Toast with Action
      </Button>
    )
  },
}

export const Destructive: Story = {
  render: function ToastDemo() {
    const { toast } = useToast()

    return (
      <Button
        variant="outline"
        onClick={() => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Something went wrong. Please try again.',
          })
        }}
      >
        Show Destructive Toast
      </Button>
    )
  },
}
