'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'
import { SheetClose } from '~/components/ui/sheet'
import { useSession } from 'next-auth/react'
import { createOptimisticBatch } from '~/lib/optimistic-update'
import { useToast } from '~/hooks/use-toast'
import { format } from 'date-fns'
import { DatePicker } from '~/components/ui/date-picker'
import { CreateFormWrapper } from '~/components/create-form-wrapper'

const createBatchSchema = z.object({
  name: z.string().min(1, 'Batch name is required'),
  geneticId: z.number(),
  plantCount: z.number().min(1),
  notes: z.string().optional(),
  // Plant details
  source: z.enum(['seed', 'clone', 'mother']),
  stage: z.enum(['seedling', 'vegetative', 'flowering']),
  plantDate: z.date(),
  healthStatus: z.enum(['healthy', 'sick', 'pest', 'nutrient']),
  motherId: z.number().optional(),
  generation: z.number().optional(),
  sex: z.enum(['male', 'female', 'hermaphrodite', 'unknown']).optional(),
  phenotype: z.string().optional(),
  locationId: z.number().optional(),
})

export function CreateBatchForm() {
  return (
    <CreateFormWrapper>
      <CreateBatchFormContent />
    </CreateFormWrapper>
  )
}

function CreateBatchFormContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const utils = api.useUtils()
  const { toast } = useToast()
  const { data: genetics } = api.genetic.list.useQuery()

  const form = useForm<z.infer<typeof createBatchSchema>>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: {
      source: 'clone',
      stage: 'seedling',
      plantDate: new Date(),
      healthStatus: 'healthy',
      plantCount: 1,
    },
  })

  const createBatch = api.batch.create.useMutation({
    onMutate: async (newBatch) => {
      if (!session?.user) {
        throw new Error('Must be logged in to create batches')
      }

      await utils.batch.list.cancel()
      const previousBatches = utils.batch.list.getData()

      utils.batch.list.setData(undefined, (old) => {
        const optimisticBatch = createOptimisticBatch(newBatch, {
          id: session.user.id,
          name: session.user.name ?? null,
          email: session.user.email ?? null,
        })

        if (!old) return [optimisticBatch]
        return [...old, optimisticBatch]
      })

      return { previousBatches }
    },
    onError: (err, newBatch, context) => {
      utils.batch.list.setData(undefined, context?.previousBatches)
      toast({
        title: 'Failed to create batch',
        description: 'Please try again',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      form.reset()
      toast({
        title: 'Batch created',
        description: 'Your batch has been created successfully',
      })
    },
    onSettled: () => {
      void utils.batch.list.invalidate()
    },
  })

  async function onSubmit(values: z.infer<typeof createBatchSchema>) {
    try {
      await createBatch.mutateAsync(values)
      const sheetClose = document.querySelector(
        '[data-sheet-close]'
      ) as HTMLButtonElement
      sheetClose?.click()
    } catch (error) {
      console.error('Failed to create batch:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Batch Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter batch name" />
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
                    <SelectValue placeholder="Select genetic" />
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
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  min={1}
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
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
              <FormLabel>Stage</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
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
            <FormItem>
              <FormLabel>Plant Date</FormLabel>
              <FormControl>
                <DatePicker date={field.value} onChange={field.onChange} />
              </FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Add any notes about this batch"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
          <Button type="submit" disabled={createBatch.isPending}>
            {createBatch.isPending ? 'Creating...' : 'Create Batch'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
