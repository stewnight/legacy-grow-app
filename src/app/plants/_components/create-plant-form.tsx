'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'
import { SheetClose } from '~/components/ui/sheet'
import { useSession } from 'next-auth/react'
import { createOptimisticPlant } from '~/lib/optimistic-update'
import { useToast } from '~/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { CreateFormWrapper } from '~/components/create-form-wrapper'

const createPlantSchema = z.object({
  batchId: z.number().optional(),
  source: z.enum(['seed', 'clone', 'mother']),
  stage: z.enum(['seedling', 'vegetative', 'flowering']),
  plantDate: z.date(),
  healthStatus: z
    .enum(['healthy', 'sick', 'pest', 'nutrient'])
    .default('healthy'),
  quarantine: z.boolean().default(false),
  geneticId: z.number().optional(),
  motherId: z.number().optional(),
  generation: z.number().optional(),
  sex: z.enum(['male', 'female', 'hermaphrodite', 'unknown']).optional(),
  phenotype: z.string().optional(),
  locationId: z.number().optional(),
  destroyReason: z.string().optional(),
})

export function CreatePlantForm() {
  return (
    <CreateFormWrapper>
      <CreatePlantFormContent />
    </CreateFormWrapper>
  )
}

function CreatePlantFormContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const utils = api.useUtils()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof createPlantSchema>>({
    resolver: zodResolver(createPlantSchema),
    defaultValues: {
      source: 'seed',
      stage: 'seedling',
      plantDate: new Date(),
      healthStatus: 'healthy',
      quarantine: false,
    },
  })

  const createPlant = api.plant.create.useMutation({
    onMutate: async (newPlant) => {
      if (!session?.user) {
        throw new Error('Must be logged in to create plants')
      }

      // Cancel any outgoing refetches
      await utils.plant.list.cancel()

      // Snapshot the previous value
      const previousPlants = utils.plant.list.getData()

      // Optimistically update to the new value
      utils.plant.list.setData(undefined, (old) => {
        const optimisticPlant = createOptimisticPlant(newPlant, {
          id: session.user.id,
          name: session.user.name ?? null,
          email: session.user.email ?? null,
        })

        if (!old) return [optimisticPlant]
        return [...old, optimisticPlant]
      })

      return { previousPlants }
    },
    onError: (err, newPlant, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      utils.plant.list.setData(undefined, context?.previousPlants)
      toast({
        title: 'Failed to create plant',
        description: 'Please try again',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      form.reset()
      toast({
        title: 'Plant created',
        description: 'Your plant has been created successfully',
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      void utils.plant.list.invalidate()
    },
  })

  async function onSubmit(values: z.infer<typeof createPlantSchema>) {
    try {
      await createPlant.mutateAsync(values)
      const sheetClose = document.querySelector(
        '[data-sheet-close]'
      ) as HTMLButtonElement
      sheetClose?.click()
    } catch (error) {
      console.error('Failed to create plant:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="flex justify-end gap-4">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
          <Button type="submit">Create Plant</Button>
        </div>
      </form>
    </Form>
  )
}
