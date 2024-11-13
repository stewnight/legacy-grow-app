'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from 'react-hook-form'
import { z } from 'zod'
import { type Facility } from '~/server/db/schema'
import { Input } from '~/components/ui/input'
import { api } from '@/trpc/react'
import { useRouter } from 'next/navigation'
import { useToast } from '~/hooks/use-toast'
import { useSession } from 'next-auth/react'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from '~/components/ui/form'
import {
  FacilityFormData,
  facilityInput,
} from '../../../server/api/routers/facility'

interface FacilityFormProps {
  mode: 'create' | 'edit'
  facility?: Facility
  onSuccess?: () => void
}

export function FacilityForm({ mode, facility, onSuccess }: FacilityFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const utils = api.useUtils()
  const { data: session } = useSession()

  const form = useForm<FacilityFormData>({
    resolver: zodResolver(facilityInput),
  })

  const onSubmit = async (data: FacilityFormData) => {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-h-[calc(100vh-10rem)] px-2"
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
      </form>
    </Form>
  )
}
