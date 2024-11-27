'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insertRoomSchema } from '~/server/db/schema'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type z } from 'zod'
import { roomTypeEnum, statusEnum } from '~/server/db/schema/enums'
import { type inferRouterOutputs } from '@trpc/server'
import { type AppRouter } from '~/server/api/root'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'
import { useRouter } from 'next/navigation'
import React from 'react'
import { RefreshCw } from 'lucide-react'
import { type UseFormReturn } from 'react-hook-form'

type RouterOutputs = inferRouterOutputs<AppRouter>
type RoomFormValues = z.infer<typeof insertRoomSchema>

interface RoomFormProps {
  mode?: 'create' | 'edit'
  defaultValues?: RouterOutputs['room']['get']
  onSuccess?: (data: RoomFormValues) => void
}

export function RoomForm({
  mode = 'create',
  defaultValues,
  onSuccess,
}: RoomFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = api.useUtils()
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(insertRoomSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      capacity: defaultValues?.capacity || 10,
      status: defaultValues?.status || statusEnum.enumValues[0],
      buildingId: defaultValues?.buildingId || '',
      parentId: defaultValues?.parentId || undefined,
      type: defaultValues?.type || undefined,
      properties: defaultValues?.properties || {
        temperature: { min: 65, max: 80 },
        humidity: { min: 40, max: 60 },
        light: { type: 'LED', intensity: 100 },
        co2: { min: 400, max: 1500 },
      },
      dimensions: defaultValues?.dimensions || {
        length: 10,
        width: 10,
        height: 8,
        unit: 'm',
        usableSqDimensions: undefined,
      },
    },
  })

  const { mutate: createRoom, isPending: isCreating } =
    api.room.create.useMutation({
      onSuccess: (data) => {
        toast({ title: 'Room created successfully' })
        void Promise.all([
          utils.room.getAll.invalidate(),
          utils.room.get.invalidate(data.id),
        ])
        router.push(`/rooms/${data.id}`)
        onSuccess?.(data)
      },
      onError: (error) => {
        toast({
          title: 'Error creating room',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateRoom, isPending: isUpdating } =
    api.room.update.useMutation({
      onSuccess: (data) => {
        toast({ title: 'Room updated successfully' })
        void Promise.all([
          utils.room.getAll.invalidate(),
          utils.room.get.invalidate(data.id),
        ])
        onSuccess?.(data)
      },
      onError: (error) => {
        toast({
          title: 'Error updating room',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  function onSubmit(values: RoomFormValues) {
    if (mode === 'create') {
      createRoom(values)
    } else if (defaultValues?.id) {
      updateRoom({ id: defaultValues.id, data: values })
    }
  }

  const { data: buildings } = api.building.getAll.useQuery({
    limit: 100,
    filters: { status: 'active' },
  })

  const { data: parentRooms } = api.room.getAll.useQuery({
    limit: 100,
    filters: { status: 'active' },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          form.handleSubmit(onSubmit, (errors) => {
            console.log('Form Errors:', errors)
          })(e)
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
                <Input {...field} />
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
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roomTypeEnum.enumValues.map((type) => (
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
          name="buildingId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Building</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {buildings?.items.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
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
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lung Room</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === 'undefined' ? undefined : value)
                }
                defaultValue={field.value || 'undefined'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lung room" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={'undefined'}>None</SelectItem>
                  {parentRooms?.items.map((room) => (
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

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={
                    typeof field.value === 'string' ||
                    typeof field.value === 'number'
                      ? field.value
                      : ''
                  }
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === '' ? null : Number(e.target.value)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dimensions.length"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Length</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={
                    typeof field.value === 'string' ||
                    typeof field.value === 'number'
                      ? field.value
                      : ''
                  }
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === '' ? null : Number(e.target.value)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dimensions.width"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Width</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={
                    typeof field.value === 'string' ||
                    typeof field.value === 'number'
                      ? field.value
                      : ''
                  }
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === '' ? undefined : Number(e.target.value)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dimensions.height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={
                    typeof field.value === 'string' ||
                    typeof field.value === 'number'
                      ? field.value
                      : ''
                  }
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === '' ? undefined : Number(e.target.value)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dimensions.unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="m">Meters</SelectItem>
                  <SelectItem value="ft">Feet</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dimensions.usableSqDimensions"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Usable Sq Dimensions
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => {
                    const length = form.getValues('dimensions.length')
                    const width = form.getValues('dimensions.width')
                    const usableSq =
                      length && width ? Number(length) * Number(width) : null
                    form.setValue('dimensions.usableSqDimensions', usableSq)
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={
                    typeof field.value === 'string' ||
                    typeof field.value === 'number'
                      ? field.value
                      : ''
                  }
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === '' ? undefined : Number(e.target.value)
                    )
                  }
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

        <Button type="submit" disabled={isCreating || isUpdating}>
          {mode === 'create' ? 'Create Area' : 'Update Area'}
        </Button>
      </form>
    </Form>
  )
}
