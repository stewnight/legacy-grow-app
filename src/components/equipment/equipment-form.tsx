'use client'

import * as React from 'react'
import {
  type Equipment,
  insertEquipmentSchema,
} from '~/server/db/schema/equipment'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { addDays, startOfToday } from 'date-fns'
import { type z } from 'zod'
import {
  equipmentTypeEnum,
  equipmentStatusEnum,
  maintenanceFrequencyEnum,
} from '~/server/db/schema/enums'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'
import { useToast } from '~/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { type TRPCClientErrorLike } from '@trpc/client'
import { AppRouter } from '../../server/api/root'

type FormData = z.infer<typeof insertEquipmentSchema>

interface EquipmentFormProps {
  mode: 'create' | 'edit'
  initialData?: Equipment
  onSuccess?: (data: Equipment) => void
}

export function EquipmentForm({
  mode = 'create',
  initialData,
  onSuccess,
}: EquipmentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const utils = api.useUtils()

  // Get available rooms
  const { data: rooms } = api.room.getAll.useQuery({
    limit: 100,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(insertEquipmentSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      type: initialData?.type ?? 'sensor',
      manufacturer: initialData?.manufacturer ?? '',
      model: initialData?.model ?? '',
      serialNumber: initialData?.serialNumber ?? '',
      status: initialData?.status ?? 'active',
      maintenanceFrequency: initialData?.maintenanceFrequency ?? 'monthly',
      purchaseDate: initialData?.purchaseDate
        ? new Date(initialData.purchaseDate)
        : undefined,
      warrantyExpiration: initialData?.warrantyExpiration
        ? new Date(initialData.warrantyExpiration)
        : undefined,
      lastMaintenanceDate: initialData?.lastMaintenanceDate
        ? new Date(initialData.lastMaintenanceDate)
        : undefined,
      nextMaintenanceDate: initialData?.nextMaintenanceDate
        ? new Date(initialData.nextMaintenanceDate)
        : addDays(startOfToday(), 30),
      roomId: initialData?.roomId ?? null,
      locationId: initialData?.locationId ?? null,
      notes: initialData?.notes ?? '',
      metadata: initialData?.metadata ?? {},
      specifications: initialData?.specifications ?? {},
    },
  })

  // Get available locations based on selected room
  const { data: locations } = api.location.getAll.useQuery(
    {
      filters: {
        roomId: form.watch('roomId') ?? undefined,
      },
    },
    {
      enabled: !!form.watch('roomId'),
    }
  )

  const { mutate: createEquipment, isPending: isCreating } =
    api.equipment.create.useMutation({
      onSuccess: async (data) => {
        toast({ title: 'Equipment created successfully' })
        await Promise.all([
          utils.equipment.getAll.invalidate(),
          utils.equipment.getById.invalidate(data.id),
        ])
        router.push(`/equipment/${data.id}`)
        onSuccess?.(data)
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error creating equipment',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateEquipment, isPending: isUpdating } =
    api.equipment.update.useMutation({
      onSuccess: async (data) => {
        toast({ title: 'Equipment updated successfully' })
        await Promise.all([
          utils.equipment.getAll.invalidate(),
          utils.equipment.getById.invalidate(data.id),
        ])
        onSuccess?.(data)
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error updating equipment',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const onSubmit = async (values: FormData) => {
    try {
      if (mode === 'create') {
        await createEquipment(values)
      } else if (initialData?.id) {
        await updateEquipment({ id: initialData.id, data: values })
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit(onSubmit)(e)
        }}
        className="space-y-4 p-1"
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Equipment name"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {equipmentTypeEnum.enumValues.map((type) => (
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

        <FormField
          control={form.control}
          name="manufacturer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manufacturer</FormLabel>
              <FormControl>
                <Input
                  placeholder="Manufacturer name"
                  {...field}
                  value={field.value || ''}
                />
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
                <Input
                  placeholder="Model number"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serialNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="Serial number"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {equipmentStatusEnum.enumValues.map((status) => (
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

        <FormField
          control={form.control}
          name="maintenanceFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maintenance Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {maintenanceFrequencyEnum.enumValues.map((frequency) => (
                    <SelectItem key={frequency} value={frequency}>
                      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purchaseDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Purchase Date</FormLabel>
              <DatePicker date={field.value} onDateChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="warrantyExpiration"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Warranty Expiration</FormLabel>
              <DatePicker date={field.value} onDateChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastMaintenanceDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Last Maintenance Date</FormLabel>
              <DatePicker date={field.value} onDateChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextMaintenanceDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Next Maintenance Date</FormLabel>
              <DatePicker date={field.value} onDateChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room</FormLabel>
              <Select
                onValueChange={(value) => {
                  const newRoomId = value === 'null' ? null : value
                  field.onChange(newRoomId)
                }}
                defaultValue={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">No Room</SelectItem>
                  {rooms?.items.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('roomId') && (
          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const newLocationId = value === 'null' ? null : value
                    field.onChange(newLocationId)
                  }}
                  defaultValue={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">No Location</SelectItem>
                    {locations?.items.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
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
            'Create Equipment'
          ) : (
            'Update Equipment'
          )}
        </Button>
      </form>
    </Form>
  )
}
