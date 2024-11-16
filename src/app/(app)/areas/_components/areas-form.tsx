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
type AreaProperties = z.infer<typeof insertAreaSchema.shape.properties>
type AreaDimensions = z.infer<typeof insertAreaSchema.shape.dimensions>

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
      capacity: defaultValues?.capacity || 0,
      status: defaultValues?.status || 'active',
      parentId: defaultValues?.parentId || null,
      facilityId: defaultValues?.facilityId || '',
      type: defaultValues?.type || undefined,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  value={field.value ?? ''}
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
