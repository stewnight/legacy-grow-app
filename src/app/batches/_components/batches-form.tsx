'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insertBatchSchema } from '~/server/db/schema'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useToast } from '~/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { type z } from 'zod'
import { plantStageEnum } from '~/server/db/schema/enums'
import { api } from '~/trpc/react'
import { type inferRouterOutputs } from '@trpc/server'
import { AppRouter } from '~/server/api/root'

// Use TRPC type inference for the batch router
type RouterOutputs = inferRouterOutputs<AppRouter>
type BatchFormValues = z.infer<typeof insertBatchSchema>

interface BatchesFormProps {
  mode: 'create' | 'edit'
  defaultValues?: RouterOutputs['batch']['get'] // Fix defaultValues type
  onSuccess?: () => void
}

export function BatchesForm({
  mode,
  defaultValues,
  onSuccess,
}: BatchesFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = api.useUtils()

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(insertBatchSchema),
    defaultValues: {
      identifier: defaultValues?.identifier || '',
      stage: defaultValues?.stage || 'seedling',
      batchStatus: defaultValues?.batchStatus || 'active',
      plantCount: defaultValues?.plantCount || 0,
      startDate:
        defaultValues?.startDate || new Date().toISOString().split('T')[0],
      geneticId: defaultValues?.geneticId || '',
      locationId: defaultValues?.locationId || '',
    },
  })

  const { mutate: createBatch, isPending: isCreating } =
    api.batch.create.useMutation({
      onSuccess: () => {
        toast({ title: 'Batch created successfully' })
        void utils.batch.getAll.invalidate()
        onSuccess?.()
      },
      onError: (error) => {
        toast({
          title: 'Error creating batch',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateBatch, isPending: isUpdating } =
    api.batch.update.useMutation({
      onSuccess: () => {
        toast({ title: 'Batch updated successfully' })
        void utils.batch.getAll.invalidate()
        onSuccess?.()
      },
      onError: (error) => {
        toast({
          title: 'Error updating batch',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  function onSubmit(data: BatchFormValues) {
    if (mode === 'create') {
      if (!data.geneticId || !data.locationId) {
        toast({
          title: 'Missing required fields',
          description: 'Genetic and Location are required',
          variant: 'destructive',
        })
        return
      }
      createBatch(data)
    } else if (defaultValues?.id) {
      updateBatch({ id: defaultValues.id, data })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifier</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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

        {/* Add Genetic Selection */}
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
                  {/* Add your genetics options here */}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Add Location Selection */}
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
                  {/* Add your locations options here */}
                </SelectContent>
              </Select>
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
                  value={field.value?.toString() || ''}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value, 10) : 0
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
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
          {mode === 'create' ? 'Create Batch' : 'Update Batch'}
        </Button>
      </form>
    </Form>
  )
}
