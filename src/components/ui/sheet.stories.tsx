import type { Meta, StoryObj } from '@storybook/react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from './sheet'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof Sheet>

export const Default: Story = {
  args: {
    children: (
      <>
        <SheetTrigger asChild>
          <Button variant="outline">Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value="Pedro Duarte" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" value="@peduarte" className="col-span-3" />
            </div>
          </div>
          <SheetFooter>
            <Button type="submit">Save changes</Button>
          </SheetFooter>
        </SheetContent>
      </>
    ),
  },
}

export const SideSheet: Story = {
  args: {
    children: (
      <>
        <SheetTrigger asChild>
          <Button>Open Side Panel</Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Side Panel</SheetTitle>
            <SheetDescription>This is a side panel that slides in from the right.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              This panel can be used for additional content, forms, or details.
            </p>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm">Content goes here</p>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Continue</Button>
          </SheetFooter>
        </SheetContent>
      </>
    ),
  },
}
