import type { Meta, StoryObj } from '@storybook/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { Button } from './button';
import { ChevronsUpDown } from 'lucide-react';

const meta = {
  title: 'UI/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <span>Toggle</span>
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 font-mono text-sm">Content 1</div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">Content 2</div>
        </CollapsibleContent>
      </>
    ),
  },
};

export const WithCustomTrigger: Story = {
  args: {
    className: 'w-[350px] space-y-2',
    children: (
      <>
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">Notifications</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-2 text-sm">Push Notifications</div>
          <div className="rounded-md border px-4 py-2 text-sm">Email Notifications</div>
          <div className="rounded-md border px-4 py-2 text-sm">SMS Notifications</div>
        </CollapsibleContent>
      </>
    ),
  },
};
