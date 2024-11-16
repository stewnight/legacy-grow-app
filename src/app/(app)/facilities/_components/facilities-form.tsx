'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  insertFacilitySchema,
  facilityTypeEnum,
  statusEnum,
} from '~/server/db/schema'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '~/components/ui/form'
import { useToast } from '~/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { api } from '~/trpc/react'
import { type z } from 'zod'
import { type AppRouter } from '~/server/api/root'
import { inferRouterOutputs } from '@trpc/server'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select'

type RouterOutputs = inferRouterOutputs<AppRouter>
type FacilityFormValues = z.infer<typeof insertFacilitySchema>

interface AddressType {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

interface FacilityFormProps {
  mode: 'create' | 'edit'
  defaultValues?: RouterOutputs['facility']['get']
  onSuccess?: (data: FacilityFormValues) => void
}

export function FacilitiesForm({
  mode = 'create',
  defaultValues,
  onSuccess,
}: FacilityFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = api.useUtils()

  const defaultAddress: AddressType = {
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
  }

  const form = useForm<FacilityFormValues>({
    resolver: zodResolver(insertFacilitySchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      type: defaultValues?.type ?? facilityTypeEnum.enumValues[0],
      status: defaultValues?.status ?? statusEnum.enumValues[0],
    },
  })

  const { mutate: createFacility, isPending: isCreating } =
    api.facility.create.useMutation({
      onSuccess: (data) => {
        toast({ title: 'Facility created successfully' })
        void Promise.all([
          utils.facility.getAll.invalidate(),
          utils.facility.get.invalidate(data.id),
        ])
        router.push(`/facilities/${data.id}`)
        onSuccess?.(data)
      },
      onError: (error) => {
        toast({
          title: 'Error creating facility',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateFacility, isPending: isUpdating } =
    api.facility.update.useMutation({
      onSuccess: (data) => {
        toast({ title: 'Facility updated successfully' })
        void Promise.all([
          utils.facility.getAll.invalidate(),
          utils.facility.get.invalidate(data.id),
        ])
        onSuccess?.(data)
      },
      onError: (error) => {
        toast({
          title: 'Error updating facility',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  async function onSubmit(values: FacilityFormValues) {
    if (mode === 'create') {
      createFacility(values)
    } else if (defaultValues?.id) {
      updateFacility({ id: defaultValues.id, data: values })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          form.handleSubmit(onSubmit, (errors) => {
            console.log('Form Errors:', errors)
          })(e)
        }}
        className="space-y-4"
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
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilityTypeEnum.enumValues.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">Address Information</h3>

          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={
                      typeof field.value === 'string' ||
                      typeof field.value === 'number'
                        ? field.value
                        : ''
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        typeof field.value === 'string' ||
                        typeof field.value === 'number'
                          ? field.value
                          : ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        typeof field.value === 'string' ||
                        typeof field.value === 'number'
                          ? field.value
                          : ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        typeof field.value === 'string' ||
                        typeof field.value === 'number'
                          ? field.value
                          : ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        typeof field.value === 'string' ||
                        typeof field.value === 'number'
                          ? field.value
                          : ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.coordinates.latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      value={
                        typeof field.value === 'number'
                          ? field.value
                          : Number(field.value) || 0
                      }
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.coordinates.longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      value={
                        typeof field.value === 'number'
                          ? field.value
                          : Number(field.value) || 0
                      }
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isCreating || isUpdating}>
          {mode === 'create' ? 'Create Facility' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  )
}
