import type { Meta, StoryObj } from '@storybook/react'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Label } from './label'

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof RadioGroup>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">Option One</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">Option Two</Label>
      </div>
    </RadioGroup>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <RadioGroup defaultValue="card">
      <div className="grid gap-4">
        <div className="flex items-center space-x-3 space-y-0">
          <RadioGroupItem value="card" id="card" />
          <div className="grid gap-1.5">
            <Label htmlFor="card">Card Payment</Label>
            <p className="text-sm text-muted-foreground">Pay with your credit or debit card.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 space-y-0">
          <RadioGroupItem value="paypal" id="paypal" />
          <div className="grid gap-1.5">
            <Label htmlFor="paypal">PayPal</Label>
            <p className="text-sm text-muted-foreground">Pay with your PayPal account.</p>
          </div>
        </div>
      </div>
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one" disabled>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="disabled-one" />
        <Label htmlFor="disabled-one" className="text-muted-foreground">
          Disabled Option One
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="disabled-two" />
        <Label htmlFor="disabled-two" className="text-muted-foreground">
          Disabled Option Two
        </Label>
      </div>
    </RadioGroup>
  ),
}
