'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { type z } from 'zod'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'
import { toast } from '~/hooks/use-toast'
import {
  insertProcessingSchema,
  type ProcessingWithRelations,
  processingPropertiesSchema,
} from '~/server/db/schema/processing'
import { DatePicker } from '~/components/ui/date-picker'
import { Loader2 } from 'lucide-react'
import { type TRPCClientErrorLike } from '@trpc/client'
import { type AppRouter } from '~/server/api/root'

type FormData = z.infer<typeof insertProcessingSchema>

interface ProcessingFormProps {
  mode?: 'create' | 'edit'
  initialData?: ProcessingWithRelations
}

export function ProcessingForm({
  mode = 'create',
  initialData,
}: ProcessingFormProps) {
  const router = useRouter()
  const form = useForm<FormData>({
    resolver: zodResolver(insertProcessingSchema),
    defaultValues: {
      type: initialData?.type || 'drying',
      method: initialData?.method || 'hang_dry',
      status: initialData?.status || 'pending',
      harvestId: initialData?.harvestId || '',
      batchId: initialData?.batchId || '',
      locationId: initialData?.locationId || '',
      inputWeight: initialData?.inputWeight?.toString() || '0',
      startedAt: initialData?.startedAt,
      completedAt: initialData?.completedAt,
      estimatedDuration: initialData?.estimatedDuration?.toString(),
      actualDuration: initialData?.actualDuration?.toString(),
      outputWeight: initialData?.outputWeight?.toString(),
      yieldPercentage: initialData?.yieldPercentage?.toString(),
      properties: initialData?.properties || {},
      labResults: initialData?.labResults || {},
    },
  })

  const { mutate: createProcessing, isPending: isCreating } =
    api.processing.create.useMutation({
      onSuccess: () => {
        toast({
          title: 'Processing created successfully',
        })
        router.push('/processing')
        router.refresh()
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error creating processing',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateProcessing, isPending: isUpdating } =
    api.processing.update.useMutation({
      onSuccess: () => {
        toast({
          title: 'Processing updated successfully',
        })
        router.push('/processing')
        router.refresh()
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: 'Error updating processing',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  function onSubmit(data: FormData) {
    try {
      const formData = {
        ...data,
        harvestId: data.harvestId,
        batchId: data.batchId,
        locationId: data.locationId,
        inputWeight: parseFloat(data.inputWeight),
        outputWeight: data.outputWeight ? parseFloat(data.outputWeight) : null,
        yieldPercentage: data.yieldPercentage
          ? parseFloat(data.yieldPercentage)
          : null,
        estimatedDuration: data.estimatedDuration
          ? parseFloat(data.estimatedDuration)
          : null,
        actualDuration: data.actualDuration
          ? parseFloat(data.actualDuration)
          : null,
        properties: data.properties || {},
        labResults: data.labResults || {},
      }

      if (mode === 'create') {
        createProcessing(formData)
      } else if (initialData?.id) {
        updateProcessing({ id: initialData.id, data: formData })
      }
    } catch (error) {
      toast({
        title: 'Error submitting form',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="harvestId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harvest</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="batchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
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
                <FormControl>
                  <Input {...field} required />
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
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="drying">Drying</SelectItem>
                    <SelectItem value="curing">Curing</SelectItem>
                    <SelectItem value="extraction">Extraction</SelectItem>
                    <SelectItem value="trimming">Trimming</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hang_dry">Hang Dry</SelectItem>
                    <SelectItem value="rack_dry">Rack Dry</SelectItem>
                    <SelectItem value="freeze_dry">Freeze Dry</SelectItem>
                    <SelectItem value="jar_cure">Jar Cure</SelectItem>
                    <SelectItem value="bulk_cure">Bulk Cure</SelectItem>
                    <SelectItem value="co2">CO2</SelectItem>
                    <SelectItem value="ethanol">Ethanol</SelectItem>
                    <SelectItem value="hydrocarbon">Hydrocarbon</SelectItem>
                    <SelectItem value="solventless">Solventless</SelectItem>
                    <SelectItem value="hand_trim">Hand Trim</SelectItem>
                    <SelectItem value="machine_trim">Machine Trim</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inputWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Weight (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="Enter weight in grams"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="estimatedDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Duration (hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="Enter estimated duration"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    value={field.value ?? ''}
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
                    step="0.001"
                    placeholder="Enter output weight"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
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
                <FormLabel>Yield Percentage (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter yield percentage"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : mode === 'create' ? (
              'Create Processing'
            ) : (
              'Update Processing'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
