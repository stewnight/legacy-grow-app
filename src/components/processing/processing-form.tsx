'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insertProcessingSchema, type Processing } from '~/server/db/schema'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { api } from '~/trpc/react'
import { useToast } from '~/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { type AppRouter } from '~/server/api/root'
import { type inferRouterOutputs } from '@trpc/server'
import { z } from 'zod'
import { type TRPCClientErrorLike } from '@trpc/client'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { DatePicker } from '~/components/ui/date-picker'
import React from 'react'
import { batchStatusEnum, harvestQualityEnum } from '~/server/db/schema/enums'

type RouterOutputs = inferRouterOutputs<AppRouter>

interface ProcessingFormProps {
  mode: 'create' | 'edit'
  initialData?: Processing
}

const processingFormSchema = insertProcessingSchema.extend({
  properties: z
    .object({
      equipment: z
        .array(
          z.object({
            name: z.string(),
            type: z.string(),
            settings: z.record(z.unknown()).optional(),
          })
        )
        .optional(),
      environment: z
        .object({
          temperature: z.number(),
          humidity: z.number(),
          pressure: z.number().optional(),
          lightLevel: z.number().optional(),
          airflow: z.number().optional(),
        })
        .optional(),
      materials: z
        .array(
          z.object({
            name: z.string(),
            amount: z.number(),
            unit: z.string(),
            batch: z.string().optional(),
          })
        )
        .optional(),
      stages: z
        .array(
          z.object({
            name: z.string(),
            duration: z.number(),
            conditions: z.record(z.unknown()).optional(),
            completedAt: z.string().optional(),
          })
        )
        .optional(),
    })
    .optional(),
  labResults: z
    .object({
      potency: z
        .object({
          thc: z.number(),
          cbd: z.number(),
          totalCannabinoids: z.number(),
        })
        .optional(),
      terpenes: z
        .array(
          z.object({
            name: z.string(),
            percentage: z.number(),
          })
        )
        .optional(),
      contaminants: z
        .object({
          microbial: z.boolean(),
          metals: z.boolean(),
          pesticides: z.boolean(),
          solvents: z.boolean().optional(),
        })
        .optional(),
      moisture: z.number().optional(),
      density: z.number().optional(),
      viscosity: z.number().optional(),
      color: z.string().optional(),
      testedAt: z.string().optional(),
      testedBy: z.string().optional(),
      certificateUrl: z.string().optional(),
    })
    .optional(),
  metadata: z
    .object({
      operators: z
        .array(
          z.object({
            userId: z.string(),
            role: z.string(),
            hours: z.number(),
          })
        )
        .optional(),
      qualityChecks: z
        .array(
          z.object({
            timestamp: z.string(),
            parameter: z.string(),
            value: z.unknown(),
            operator: z.string(),
          })
        )
        .optional(),
      notes: z.array(z.string()).optional(),
      images: z
        .array(
          z.object({
            url: z.string(),
            type: z.string(),
            timestamp: z.string(),
          })
        )
        .optional(),
      costs: z
        .object({
          labor: z.number(),
          materials: z.number(),
          energy: z.number(),
          other: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
})

type ProcessingFormValues = z.infer<typeof processingFormSchema>

export function ProcessingForm({ mode, initialData }: ProcessingFormProps) {
  const utils = api.useUtils()
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<ProcessingFormValues>({
    resolver: zodResolver(processingFormSchema),
    defaultValues: {
      identifier: initialData?.identifier ?? '',
      type: initialData?.type ?? '',
      method: initialData?.method ?? '',
      inputWeight: initialData?.inputWeight ?? undefined,
      outputWeight: initialData?.outputWeight ?? undefined,
      yieldPercentage: initialData?.yieldPercentage ?? undefined,
      startedAt: initialData?.startedAt ?? new Date(),
      completedAt: initialData?.completedAt ?? undefined,
      duration: initialData?.duration ?? undefined,
      processStatus: initialData?.processStatus ?? 'active',
      quality: initialData?.quality ?? undefined,
      properties: initialData?.properties ?? undefined,
      labResults: initialData?.labResults ?? undefined,
      metadata: initialData?.metadata ?? undefined,
      notes: initialData?.notes ?? '',
      status: initialData?.status ?? 'active',
    },
  })

  const { mutate: createProcessing, isPending: isCreating } =
    api.processing.create.useMutation({
      onSuccess: async () => {
        toast({ title: 'Processing record created successfully' })
        await utils.processing.invalidate()
        router.push('/processing')
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error creating processing record',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateProcessing, isPending: isUpdating } =
    api.processing.update.useMutation({
      onSuccess: async () => {
        toast({ title: 'Processing record updated successfully' })
        await utils.processing.invalidate()
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error updating processing record',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const onSubmit = async (values: ProcessingFormValues) => {
    try {
      if (mode === 'create') {
        createProcessing(values)
      } else if (initialData?.id) {
        updateProcessing({
          id: initialData.id,
          data: values,
        })
      }
    } catch (error) {
      toast({
        title: 'Error submitting form',
        description: error as string,
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Method</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="inputWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Weight (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
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
            name="outputWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Output Weight (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="yieldPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yield (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startedAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
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
            name="completedAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Completion Date</FormLabel>
                <DatePicker
                  date={field.value ? new Date(field.value) : undefined}
                  onDateChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="processStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Process Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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

          <FormField
            control={form.control}
            name="quality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quality</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {harvestQualityEnum.enumValues.map((quality) => (
                      <SelectItem key={quality} value={quality}>
                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  {...field}
                  placeholder="Add any additional notes..."
                  value={field.value ?? ''}
                />
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
          {isCreating || isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : mode === 'create' ? (
            'Create Processing Record'
          ) : (
            'Update Processing Record'
          )}
        </Button>
      </form>
    </Form>
  )
}

const HarvestSelector = React.memo(function HarvestSelector({
  onSelect,
}: {
  onSelect: (value: string) => void
}) {
  const { data, isLoading } = api.harvest.getAll.useQuery(
    { limit: 50 },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (!data?.items?.length) {
    return <SelectItem value="none">No harvests found</SelectItem>
  }

  return (
    <>
      {data.items.map((harvest) => (
        <SelectItem key={harvest.id} value={harvest.id}>
          {harvest.identifier}
        </SelectItem>
      ))}
    </>
  )
})

const BatchSelector = React.memo(function BatchSelector({
  onSelect,
}: {
  onSelect: (value: string) => void
}) {
  const { data, isLoading } = api.batch.getAll.useQuery(
    { limit: 50 },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (!data?.items?.length) {
    return <SelectItem value="none">No batches found</SelectItem>
  }

  return (
    <>
      {data.items.map((batch) => (
        <SelectItem key={batch.id} value={batch.id}>
          {batch.identifier}
        </SelectItem>
      ))}
    </>
  )
})

const LocationSelector = React.memo(function LocationSelector({
  onSelect,
}: {
  onSelect: (value: string) => void
}) {
  const { data, isLoading } = api.location.getAll.useQuery(
    { limit: 50 },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (!data?.items?.length) {
    return <SelectItem value="none">No locations found</SelectItem>
  }

  return (
    <>
      {data.items.map((location) => (
        <SelectItem key={location.id} value={location.id}>
          {location.name}
        </SelectItem>
      ))}
    </>
  )
})
