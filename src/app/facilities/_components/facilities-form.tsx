'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NewFacility, insertFacilitySchema } from '~/server/db/schema'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { api } from '~/trpc/react'
import { z } from 'zod'

interface FacilityFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<NewFacility>
  onSuccessfulSubmit?: () => void
}

export function FacilitiesForm({
  mode,
  initialData,
  onSuccessfulSubmit,
}: FacilityFormProps): JSX.Element {
  const form = useForm<NewFacility>({
    resolver: zodResolver(insertFacilitySchema),
    defaultValues: {
      name:
        initialData?.name ??
        `Facility-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${new Date().getTime().toString().slice(-4)}`,
      type: initialData?.type ?? 'indoor',
    },
  })

  async function onSubmit(values: z.infer<typeof insertFacilitySchema>) {
    console.log(values)
    const result = await api.facility.create.useMutation().mutateAsync(values)
    console.log(result)
    return Promise.resolve()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-10rem)] px-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => <Input {...field} />}
        />

        <div className="col-span-full flex gap-2 justify-end">
          <Button type="submit">
            {initialData ? 'Save Changes' : 'Create Batch'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
