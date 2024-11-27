import type { Meta, StoryObj } from '@storybook/react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { Button } from './button'
import { CalendarDays } from 'lucide-react'

const meta = {
  title: 'UI/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof HoverCard>

export const Default: Story = {
  args: {
    children: (
      <>
        <HoverCardTrigger asChild>
          <Button variant="link">@nextjs</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/vercel.png" />
              <AvatarFallback>VC</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">@nextjs</h4>
              <p className="text-sm">
                The React Framework – created and maintained by @vercel.
              </p>
              <div className="flex items-center pt-2">
                <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">
                  Joined December 2021
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </>
    ),
  },
}

export const WithCustomContent: Story = {
  args: {
    children: (
      <>
        <HoverCardTrigger asChild>
          <Button variant="ghost">Hover for Details</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Product Details</h4>
            <p className="text-sm text-muted-foreground">
              This is a detailed description that appears when hovering over the
              trigger element.
            </p>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-xs">Price: $99.99</span>
              <Button size="sm">Learn More</Button>
            </div>
          </div>
        </HoverCardContent>
      </>
    ),
  },
}
