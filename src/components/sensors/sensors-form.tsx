'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  insertSensorSchema,
  type SensorWithRelations,
} from '~/server/db/schema'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { type AppRouter } from '~/server/api/root'
import { type inferRouterOutputs } from '@trpc/server'
import { z } from 'zod'
import { type TRPCClientErrorLike } from '@trpc/client'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { sensorTypeEnum, statusEnum } from '~/server/db/schema/enums'
import { Textarea } from '~/components/ui/textarea'
import { DatePicker } from '~/components/ui/date-picker'
import React from 'react'

type RouterOutputs = inferRouterOutputs<AppRouter>

interface SensorFormProps {
  mode: 'create' | 'edit'
  initialData?: SensorWithRelations
}

const sensorFormSchema = insertSensorSchema.extend({
  calibrationInterval: z.number().min(0).optional(),
  specifications: z
    .object({
      range: z.object({
        min: z.number(),
        max: z.number(),
        unit: z.string(),
      }),
      accuracy: z.object({
        value: z.number(),
        unit: z.string(),
      }),
      resolution: z.object({
        value: z.number(),
        unit: z.string(),
      }),
      responseTime: z
        .object({
          value: z.number(),
          unit: z.string(),
        })
        .optional(),
      powerRequirements: z
        .object({
          voltage: z.number(),
          current: z.number(),
          type: z.enum(['AC', 'DC']),
        })
        .optional(),
    })
    .nullish(),
  metadata: z
    .object({
      installation: z.object({
        date: z.string(),
        by: z.string(),
        notes: z.string().optional(),
      }),
      maintenance: z
        .array(
          z.object({
            date: z.string(),
            type: z.string(),
            description: z.string(),
            performedBy: z.string(),
          })
        )
        .optional(),
    })
    .nullish(),
})

type SensorFormValues = z.infer<typeof sensorFormSchema>

export function SensorForm({ mode, initialData }: SensorFormProps) {
  const utils = api.useUtils()
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<SensorFormValues>({
    resolver: zodResolver(sensorFormSchema),
    defaultValues: {
      type: initialData?.type ?? 'temperature',
      manufacturer: initialData?.manufacturer ?? '',
      model: initialData?.model ?? '',
      serialNumber: initialData?.serialNumber ?? '',
      lastCalibration: initialData?.lastCalibration ?? undefined,
      nextCalibration: initialData?.nextCalibration ?? undefined,
      calibrationInterval: initialData?.calibrationInterval
        ? Number(initialData.calibrationInterval)
        : undefined,
      locationId: initialData?.locationId ?? undefined,
      specifications: initialData?.specifications ?? undefined,
      metadata: initialData?.metadata ?? undefined,
      status: initialData?.status ?? 'active',
    },
  })

  const { mutate: createSensor, isPending: isCreating } =
    api.sensor.create.useMutation({
      onSuccess: async () => {
        toast({ title: 'Sensor created successfully' })
        await utils.sensor.invalidate()
        router.push('/sensors')
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error creating sensor',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateSensor, isPending: isUpdating } =
    api.sensor.update.useMutation({
      onSuccess: async () => {
        toast({ title: 'Sensor updated successfully' })
        await utils.sensor.invalidate()
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error updating sensor',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const onSubmit = async (values: SensorFormValues) => {
    try {
      if (mode === 'create') {
        createSensor(values)
      } else if (initialData?.id) {
        updateSensor({
          id: initialData.id,
          data: values,
        })
      }
    } catch (error) {
      toast({
        title: 'Error submitting form',
        description: error as string,
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-1"
        noValidate
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sensorTypeEnum.enumValues.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="manufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturer</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="serialNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="lastCalibration"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Last Calibration</FormLabel>
                <DatePicker
                  date={field.value ? new Date(field.value) : undefined}
                  onDateChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nextCalibration"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Next Calibration</FormLabel>
                <DatePicker
                  date={field.value ? new Date(field.value) : undefined}
                  onDateChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="calibrationInterval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calibration Interval (days)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <LocationSelector onSelect={field.onChange} />
                </SelectContent>
              </Select>
              <FormDescription>
                Optional - Select a location for this sensor
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusEnum.enumValues.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isCreating || isUpdating}
          className="w-full"
        >
          {isCreating || isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : mode === 'create' ? (
            'Create Sensor'
          ) : (
            'Update Sensor'
          )}
        </Button>
      </form>
    </Form>
  )
}

const LocationSelector = React.memo(function LocationSelector({
  onSelect,
}: {
  onSelect: (value: string) => void
}) {
  const { data, isLoading } = api.location.getAll.useQuery(
    { limit: 50 },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (!data?.items?.length) {
    return <SelectItem value="none">No locations found</SelectItem>
  }

  return (
    <>
      {data.items.map((location) => (
        <SelectItem key={location.id} value={location.id}>
          {location.name}
        </SelectItem>
      ))}
    </>
  )
})

const EquipmentSelector = React.memo(function EquipmentSelector({
  onSelect,
}: {
  onSelect: (value: string) => void
}) {
  const { data, isLoading } = api.equipment.getAll.useQuery(
    { limit: 50 },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (!data?.items?.length) {
    return <SelectItem value="none">No equipment found</SelectItem>
  }

  return (
    <>
      {data.items.map((equipment) => (
        <SelectItem key={equipment.id} value={equipment.id}>
          {equipment.name}
        </SelectItem>
      ))}
    </>
  )
})
