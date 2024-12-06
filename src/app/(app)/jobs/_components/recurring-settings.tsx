'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { format } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import { cn } from '~/lib/utils'

interface RecurringSettingsProps {
  value: {
    frequency: string
    interval: number
    endDate?: string
  } | null
  onChange: (
    value: {
      frequency: string
      interval: number
      endDate?: string
    } | null
  ) => void
}

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export function RecurringSettings({ value, onChange }: RecurringSettingsProps) {
  const [isRecurring, setIsRecurring] = useState(!!value)

  const handleRecurringChange = (checked: boolean) => {
    setIsRecurring(checked)
    if (!checked) {
      onChange(null)
    } else {
      onChange({
        frequency: 'daily',
        interval: 1,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <FormLabel>Recurring Job</FormLabel>
          <div className="text-sm text-muted-foreground">
            Set up a recurring schedule for this job
          </div>
        </div>
        <Switch checked={isRecurring} onCheckedChange={handleRecurringChange} />
      </div>

      {isRecurring && value && (
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FormLabel>Frequency</FormLabel>
              <Select
                value={value.frequency}
                onValueChange={(frequency) => onChange({ ...value, frequency })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <FormLabel>Interval</FormLabel>
              <Input
                type="number"
                min={1}
                value={value.interval}
                onChange={(e) =>
                  onChange({
                    ...value,
                    interval: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <FormLabel>End Date (Optional)</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !value.endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value.endDate ? (
                    format(new Date(value.endDate), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value.endDate ? new Date(value.endDate) : undefined}
                  onSelect={(date) =>
                    onChange({
                      ...value,
                      endDate: date?.toISOString(),
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {value.endDate && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() =>
                  onChange({
                    ...value,
                    endDate: undefined,
                  })
                }
              >
                <X className="mr-2 h-4 w-4" />
                Clear end date
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
