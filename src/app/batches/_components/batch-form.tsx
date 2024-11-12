'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  Form,
  FormControl,
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
import { api } from '@/trpc/react'
import { useRouter } from 'next/navigation'
import { useToast } from '~/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { createOptimisticBatch } from '~/lib/optimistic-update'
import { DatePicker } from '~/components/ui/date-picker'
import { updateOptimisticEntity } from '~/lib/optimistic-update'
import { format } from 'date-fns'
import { batchFormSchema } from '../../../lib/validations/batch'
import type { BatchFormData, BatchWithRelations } from '~/lib/validations/batch'

interface BatchFormProps {
  mode: 'create' | 'edit'
  batch?: BatchWithRelations
  onSuccess?: () => void
}

export function BatchForm({
  mode,
  batch,
  onSuccess,
}: BatchFormProps): JSX.Element {
  const router = useRouter()
  const { toast } = useToast()
  const utils = api.useUtils()
  const { data: session } = useSession()
  const { data: genetics } = api.genetic.list.useQuery()

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: batch?.name ?? '',
      geneticId: batch?.geneticId ?? undefined,
      plantCount: batch?.plantCount ?? 1,
      notes: batch?.notes ?? '',
      source: (batch?.source as BatchFormData['source']) ?? 'clone',
      stage: (batch?.stage as BatchFormData['stage']) ?? 'seedling',
      plantDate: batch?.plantDate ? new Date(batch.plantDate) : new Date(),
      healthStatus:
        (batch?.healthStatus as BatchFormData['healthStatus']) ?? 'healthy',
      motherId: batch?.motherId ?? undefined,
      generation: batch?.generation ?? undefined,
      sex: batch?.sex ?? undefined,
      phenotype: batch?.phenotype ?? '',
      locationId: batch?.locationId ?? undefined,
    },
  })

  const createMutation = api.batch.create.useMutation({
    onMutate: async (newBatch) => {
      if (!session?.user) throw new Error('Not authenticated')

      await utils.batch.list.cancel()
      const previousData = utils.batch.list.getData()

      const optimisticUser = {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
      }

      const optimisticBatch = {
        ...createOptimisticBatch(newBatch, optimisticUser),
        plants: [],
        _count: { plants: 0 },
        createdBy: optimisticUser,
        genetic: genetics?.find((g) => g.id === newBatch.geneticId),
      } as BatchWithRelations

      utils.batch.list.setData(undefined, (old) => {
        if (!old) return []
        return [...old, optimisticBatch] as typeof old
      })

      return { previousData }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Batch created successfully',
      })
      form.reset()
      onSuccess?.()
      router.refresh()
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        utils.batch.list.setData(undefined, context.previousData)
      }
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    },
    onSettled: () => {
      void utils.batch.list.invalidate()
    },
  })

  const updateMutation = api.batch.update.useMutation({
    onMutate: async ({ code, data }) => {
      await utils.batch.getByCode.cancel()
      const previousData = utils.batch.getByCode.getData({ code })

      if (previousData) {
        utils.batch.getByCode.setData(
          { code },
          (old) => old && updateOptimisticEntity(old, data)
        )
      }

      return { previousData }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Batch updated successfully',
      })
      onSuccess?.()
      router.refresh()
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.batch.getByCode.setData(
          { code: variables.code },
          context.previousData
        )
      }
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    },
    onSettled: () => {
      void utils.batch.list.invalidate()
    },
  })

  function onSubmit(data: BatchFormData) {
    if (mode === 'create') {
      createMutation.mutate(data)
    } else if (batch) {
      updateMutation.mutate({
        code: batch.code!,
        data,
      })
    }
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
                <Input placeholder="Enter batch name" {...field} />
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
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a genetic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genetics?.map((genetic) => (
                    <SelectItem key={genetic.id} value={genetic.id.toString()}>
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
          name="plantCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plant Count</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="Number of plants"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="clone">Clone</SelectItem>
                  <SelectItem value="mother">Mother</SelectItem>
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
              <FormLabel>Growth Stage</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select growth stage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="seedling">Seedling</SelectItem>
                  <SelectItem value="vegetative">Vegetative</SelectItem>
                  <SelectItem value="flowering">Flowering</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plantDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Plant Date</FormLabel>
              <DatePicker
                date={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  field.onChange(date ? format(date, 'yyyy-MM-dd') : null)
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="healthStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Health Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select health status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="pest">Pest Issues</SelectItem>
                  <SelectItem value="nutrient">Nutrient Issues</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sex</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unknown">Unknown</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="hermaphrodite">Hermaphrodite</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phenotype"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phenotype</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter phenotype"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about this batch"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {mode === 'create' ? 'Creating...' : 'Saving...'}
            </div>
          ) : mode === 'create' ? (
            'Create Batch'
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </Form>
  )
}
