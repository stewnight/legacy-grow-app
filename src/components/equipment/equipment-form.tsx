'use client'

import * as React from 'react'
import { type Equipment, insertEquipmentSchema } from '~/server/db/schema/equipment'
import { Input } from '~/components/ui/input'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { DatePicker } from '~/components/ui/date-picker'
import { addDays, startOfToday } from 'date-fns'
import { BaseForm } from '~/components/base-form'
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
import { useState } from 'react'

type FormData = z.infer<typeof insertEquipmentSchema>

interface EquipmentFormProps {
  mode: 'create' | 'edit'
  initialData?: Equipment
  onSuccess?: (data: Equipment) => void
}

export function EquipmentForm({ mode, initialData, onSuccess }: EquipmentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialData?.roomId ?? null)

  // Get available rooms
  const { data: rooms } = api.room.getAll.useQuery({
    limit: 100,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(insertEquipmentSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate) : undefined,
          warrantyExpiration: initialData.warrantyExpiration
            ? new Date(initialData.warrantyExpiration)
            : undefined,
          lastMaintenanceDate: initialData.lastMaintenanceDate
            ? new Date(initialData.lastMaintenanceDate)
            : undefined,
          nextMaintenanceDate: initialData.nextMaintenanceDate
            ? new Date(initialData.nextMaintenanceDate)
            : undefined,
        }
      : {
          type: 'other',
          status: 'active',
          maintenanceFrequency: 'monthly',
          name: '',
          manufacturer: '',
          model: '',
          serialNumber: '',
          specifications: null,
          notes: '',
          roomId: null,
          locationId: null,
        },
  })

  // Get available locations based on selected room
  const { data: locations, refetch: refetchLocations } = api.location.getAll.useQuery(
    {
      filters: {
        roomId: selectedRoomId ?? undefined,
      },
    },
    {
      enabled: !!selectedRoomId,
    }
  )

  // Transform dates for API submission
  const transformData = (data: FormData): FormData => {
    const transformedData = { ...data }

    // Transform date fields
    const dateFields = [
      'purchaseDate',
      'warrantyExpiration',
      'lastMaintenanceDate',
      'nextMaintenanceDate',
    ] as const

    for (const field of dateFields) {
      if (transformedData[field]) {
        // Ensure we have a valid Date object
        transformedData[field] = new Date(transformedData[field])
      }
    }

    return {
      ...transformedData,
      metadata: transformedData.metadata ?? {},
      specifications: transformedData.specifications ?? {},
    }
  }

  // Parse initial dates
  const parseInitialDates = (data: Equipment | undefined) => {
    if (!data) return undefined

    const parsedData = { ...data }
    const dateFields = [
      'purchaseDate',
      'warrantyExpiration',
      'lastMaintenanceDate',
      'nextMaintenanceDate',
    ] as const

    for (const field of dateFields) {
      if (parsedData[field]) {
        parsedData[field] = new Date(parsedData[field])
      }
    }

    return parsedData
  }

  const parsedInitialData = parseInitialDates(initialData)

  return (
    <BaseForm<typeof insertEquipmentSchema, Equipment>
      mode={mode}
      schema={insertEquipmentSchema}
      initialData={parsedInitialData}
      defaultValues={{
        name: parsedInitialData?.name ?? '',
        type: parsedInitialData?.type ?? 'sensor',
        manufacturer: parsedInitialData?.manufacturer ?? '',
        model: parsedInitialData?.model ?? '',
        serialNumber: parsedInitialData?.serialNumber ?? '',
        status: parsedInitialData?.status ?? 'active',
        maintenanceFrequency: parsedInitialData?.maintenanceFrequency ?? 'monthly',
        purchaseDate: parsedInitialData?.purchaseDate ?? null,
        warrantyExpiration: parsedInitialData?.warrantyExpiration ?? null,
        lastMaintenanceDate: parsedInitialData?.lastMaintenanceDate ?? null,
        nextMaintenanceDate: parsedInitialData?.nextMaintenanceDate ?? addDays(startOfToday(), 30),
        roomId: parsedInitialData?.roomId ?? null,
        locationId: parsedInitialData?.locationId ?? null,
        notes: parsedInitialData?.notes ?? '',
        metadata: parsedInitialData?.metadata ?? {},
        specifications: parsedInitialData?.specifications ?? {},
      }}
      apiPath={{
        create: 'equipment.create',
        update: 'equipment.update',
        getAll: 'equipment.getAll',
      }}
      transformData={transformData}
      redirectPath="/equipment"
      onSuccess={onSuccess}
      buttonText={{
        create: 'Create Equipment',
        update: 'Update Equipment',
      }}
    >
      {(form) => (
        <>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Equipment name" {...field} />
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
            name="roomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const newRoomId = value === 'null' ? null : value
                    field.onChange(newRoomId)
                    setSelectedRoomId(newRoomId)
                    // Clear location when room changes
                    form.setValue('locationId', null)
                    // Refetch locations for the new room
                    void refetchLocations()
                  }}
                  defaultValue={field.value ?? 'null'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">None</SelectItem>
                    {rooms?.items.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} ({room.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Assign this equipment to a room (optional)</FormDescription>
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
                  onValueChange={(value) => field.onChange(value === 'null' ? null : value)}
                  defaultValue={field.value ?? 'null'}
                  disabled={!form.watch('roomId')}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">None</SelectItem>
                    {locations?.items.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Assign to a specific location within the room (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer</FormLabel>
                  <FormControl>
                    <Input placeholder="Manufacturer name" {...field} value={field.value ?? ''} />
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
                    <Input placeholder="Model number" {...field} value={field.value ?? ''} />
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
                  <Input placeholder="Serial number" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Purchase Date</FormLabel>
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
              name="warrantyExpiration"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Warranty Expiration</FormLabel>
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    onDateChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="lastMaintenanceDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Last Maintenance</FormLabel>
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
              name="nextMaintenanceDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Next Maintenance</FormLabel>
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
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Equipment notes"
                    className="resize-none"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </BaseForm>
  )
}
