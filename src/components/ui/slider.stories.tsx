import type { Meta, StoryObj } from '@storybook/react'
import { Slider } from './slider'
import { Label } from './label'

const meta = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof Slider>

export const Default: Story = {
  args: {
    defaultValue: [33],
    max: 100,
    step: 1,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="volume">Volume</Label>
      <Slider id="volume" defaultValue={[50]} max={100} step={1} className="w-[60%]" />
    </div>
  ),
}

export const Range: Story = {
  args: {
    defaultValue: [20, 80],
    max: 100,
    step: 1,
    className: 'w-[60%]',
  },
}

export const WithSteps: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="temperature">Temperature (°C)</Label>
      <Slider
        id="temperature"
        defaultValue={[21]}
        max={40}
        min={0}
        step={0.5}
        className="w-[60%]"
      />
    </div>
  ),
}
