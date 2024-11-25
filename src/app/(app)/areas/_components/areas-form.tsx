'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insertAreaSchema } from '~/server/db/schema'
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
import { areaTypeEnum, statusEnum } from '~/server/db/schema/enums'
import { type inferRouterOutputs } from '@trpc/server'
import { type AppRouter } from '~/server/api/root'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'
import { useRouter } from 'next/navigation'

type RouterOutputs = inferRouterOutputs<AppRouter>
type AreaFormValues = z.infer<typeof insertAreaSchema>
// Removed unused types

interface AreaFormProps {
  mode?: 'create' | 'edit'
  defaultValues?: RouterOutputs['area']['get']
  onSuccess?: (data: AreaFormValues) => void
}

export function AreaForm({
  mode = 'create',
  defaultValues,
  onSuccess,
}: AreaFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = api.useUtils()
  const form = useForm<AreaFormValues>({
    resolver: zodResolver(insertAreaSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      capacity: defaultValues?.capacity || 10,
      status: defaultValues?.status || statusEnum.enumValues[0],
      parentId: defaultValues?.parentId || '',
      facilityId: defaultValues?.facilityId || '',
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
      },
    },
  })

  const { mutate: createArea, isPending: isCreating } =
    api.area.create.useMutation({
      onSuccess: (data) => {
        toast({ title: 'Area created successfully' })
        void Promise.all([
          utils.area.getAll.invalidate(),
          utils.area.get.invalidate(data.id),
        ])
        router.push(`/areas/${data.id}`)
        onSuccess?.(data)
      },
      onError: (error) => {
        toast({
          title: 'Error creating area',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateArea, isPending: isUpdating } =
    api.area.update.useMutation({
      onSuccess: (data) => {
        toast({ title: 'Area updated successfully' })
        void Promise.all([
          utils.area.getAll.invalidate(),
          utils.area.get.invalidate(data.id),
        ])
        onSuccess?.(data)
      },
      onError: (error) => {
        toast({
          title: 'Error updating area',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  function onSubmit(values: AreaFormValues) {
    if (mode === 'create') {
      createArea(values)
    } else if (defaultValues?.id) {
      updateArea({ id: defaultValues.id, data: values })
    }
  }

  const { data: facilities } = api.facility.getAll.useQuery({
    limit: 100,
    filters: { status: 'active' },
  })

  const { data: parentAreas } = api.area.getAll.useQuery({
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
                  {areaTypeEnum.enumValues.map((type) => (
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
          name="facilityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facility</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {facilities?.items.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name}
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
              <FormLabel>Parent Area</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent area" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={'null'}>None</SelectItem>
                  {parentAreas?.items.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
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
