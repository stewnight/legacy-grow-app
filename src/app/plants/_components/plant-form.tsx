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
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'
import { useToast } from '~/hooks/use-toast'
import { useSession } from 'next-auth/react'
import {
  plantFormSchema,
  type PlantFormData,
  type PlantWithRelations,
} from '~/lib/validations/plant'
import {
  createOptimisticPlant,
  updateOptimisticEntity,
} from '~/lib/optimistic-update'
import { DatePicker } from '~/components/ui/date-picker'
import { Checkbox } from '~/components/ui/checkbox'

interface PlantFormProps {
  mode: 'create' | 'edit'
  plant?: PlantWithRelations
  batchId?: number
  onSuccess?: () => void
}

export function PlantForm({ mode, plant, batchId, onSuccess }: PlantFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const utils = api.useUtils()
  const { data: session } = useSession()
  const { data: genetics } = api.genetic.list.useQuery()

  const form = useForm<PlantFormData>({
    resolver: zodResolver(plantFormSchema),
    defaultValues: {
      batchId: batchId ?? plant?.batchId ?? undefined,
      source: plant?.source ?? 'seed',
      stage: plant?.stage ?? 'seedling',
      plantDate: plant?.plantDate ? new Date(plant.plantDate) : new Date(),
      harvestDate: plant?.harvestDate ? new Date(plant.harvestDate) : undefined,
      healthStatus:
        (plant?.healthStatus as PlantFormData['healthStatus']) ?? 'healthy',
      quarantine: plant?.quarantine ?? false,
      geneticId: plant?.geneticId ?? undefined,
      motherId: plant?.motherId ?? undefined,
      generation: plant?.generation ?? undefined,
      sex: plant?.sex ?? 'unknown',
      phenotype: plant?.phenotype ?? '',
      locationId: plant?.locationId ?? undefined,
    },
  })

  const createMutation = api.plant.create.useMutation({
    onMutate: async (newPlant) => {
      if (!session?.user) throw new Error('Not authenticated')

      await utils.plant.list.cancel()
      const previousData = utils.plant.list.getData({
        filters: batchId ? { batchId } : undefined,
      })

      const optimisticUser = {
        id: session.user.id,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
      }

      const optimisticPlant: PlantWithRelations = {
        ...createOptimisticPlant(newPlant, optimisticUser),
        genetic: genetics?.find((g) => g.id === newPlant?.geneticId) ?? null,
        batch: null,
        createdBy: optimisticUser,
      }

      utils.plant.list.setData(
        { filters: batchId ? { batchId } : undefined },
        (old) => {
          const typedOptimisticPlant =
            optimisticPlant as typeof old extends (infer T)[] ? T : never
          if (!old) return [typedOptimisticPlant]
          return [...old, typedOptimisticPlant]
        }
      )

      return { previousData }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Plant created successfully',
      })
      form.reset()
      onSuccess?.()
      router.refresh()
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        utils.plant.list.setData(
          { filters: batchId ? { batchId } : undefined },
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
      void utils.plant.list.invalidate()
    },
  })

  const updateMutation = api.plant.update.useMutation({
    onMutate: async ({ code, data }) => {
      await utils.plant.getByCode.cancel()
      const previousData = utils.plant.getByCode.getData(code)

      if (previousData) {
        utils.plant.getByCode.setData(code, (old) => {
          if (!old) return undefined
          return {
            ...old,
            ...data,
            updatedAt: new Date(),
          } as typeof old
        })
      }

      return { previousData }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Plant updated successfully',
      })
      onSuccess?.()
      router.refresh()
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.plant.getByCode.setData(variables.code, context.previousData)
      }
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    },
    onSettled: () => {
      void utils.plant.list.invalidate()
    },
  })

  function onSubmit(data: PlantFormData) {
    if (mode === 'create') {
      createMutation.mutate(data)
    } else if (plant) {
      updateMutation.mutate({
        code: plant.code,
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
                  <SelectItem value="harvested">Harvested</SelectItem>
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
              <DatePicker date={field.value} onSelect={field.onChange} />
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
                  <SelectItem value="pest">Pest</SelectItem>
                  <SelectItem value="nutrient">Nutrient</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quarantine"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Quarantine</FormLabel>
              </div>
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? 'Saving...'
            : mode === 'edit'
              ? 'Save Changes'
              : 'Create Plant'}
        </Button>
      </form>
    </Form>
  )
}
