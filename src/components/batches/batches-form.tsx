'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insertBatchSchema } from '~/server/db/schema'
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
import { plantStageEnum, batchStatusEnum } from '~/server/db/schema/enums'
import { type inferRouterOutputs } from '@trpc/server'
import { type AppRouter } from '~/server/api/root'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { format } from 'date-fns'
import { type TRPCClientErrorLike } from '@trpc/client'

type RouterOutputs = inferRouterOutputs<AppRouter>
type BatchFormValues = z.infer<typeof insertBatchSchema>

interface BatchFormProps {
  mode: 'create' | 'edit'
  defaultValues?: RouterOutputs['batch']['get']
  onSuccess?: (data: BatchFormValues) => void
}

export function BatchForm({ mode = 'create', defaultValues, onSuccess }: BatchFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = api.useUtils()

  const { data: genetics } = api.genetic.getAll.useQuery({
    limit: 100,
  })

  const { data: locations } = api.location.getAll.useQuery({
    limit: 100,
  })

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(insertBatchSchema),
    defaultValues: {
      identifier: defaultValues?.identifier || '',
      geneticId: defaultValues?.geneticId || '',
      locationId: defaultValues?.locationId || '',
      stage: defaultValues?.stage || 'germination',
      batchStatus: defaultValues?.batchStatus || 'active',
      startDate: defaultValues?.startDate || new Date(),
      plantCount: defaultValues?.plantCount || 0,
    },
  })

  const { mutate: createBatch, isPending: isCreating } = api.batch.create.useMutation({
    onSuccess: async (data) => {
      toast({ title: 'Batch created successfully' })
      await Promise.all([utils.batch.getAll.invalidate(), utils.batch.get.invalidate(data.id)])
      router.push(`/batches/${data.id}`)
      onSuccess?.(data)
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: 'Error creating batch',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const { mutate: updateBatch, isPending: isUpdating } = api.batch.update.useMutation({
    onSuccess: async (data) => {
      toast({ title: 'Batch updated successfully' })
      await Promise.all([utils.batch.getAll.invalidate(), utils.batch.get.invalidate(data.id)])
      onSuccess?.(data)
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: 'Error updating batch',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = async (values: BatchFormValues) => {
    try {
      if (mode === 'create') {
        await createBatch(values)
      } else if (defaultValues?.id) {
        await updateBatch({ id: defaultValues.id, data: values })
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
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifier</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="geneticId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genetic</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genetic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genetics?.items.map((genetic) => (
                    <SelectItem key={genetic.id} value={genetic.id}>
                      {genetic.name}
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
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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

        <FormField
          control={form.control}
          name="stage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stage</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {plantStageEnum.enumValues.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
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
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <DatePicker date={field.value} onDateChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plantCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plant Count</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="batchStatus"
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
                  {batchStatusEnum.enumValues.map((status) => (
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
          {mode === 'create' ? 'Create Batch' : 'Update Batch'}
        </Button>
      </form>
    </Form>
  )
}
