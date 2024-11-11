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
import {
  geneticFormSchema,
  type GeneticFormData,
  type GeneticWithRelations,
} from '~/lib/validations/genetic'
import {
  createOptimisticGenetic,
  updateOptimisticEntity,
} from '~/lib/optimistic-update'
import { Batch, Plant, type Genetic } from '~/server/db/schemas'

interface GeneticFormProps {
  mode: 'create' | 'edit'
  genetic?: GeneticWithRelations
  onSuccess?: () => void
}

export function GeneticForm({ mode, genetic, onSuccess }: GeneticFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const utils = api.useUtils()
  const { data: session } = useSession()

  const createMutation = api.genetic.create.useMutation({
    onMutate: async (newGenetic) => {
      if (!session?.user) throw new Error('Not authenticated')

      await utils.genetic.list.cancel()
      const previousData = utils.genetic.list.getData()

      const terpeneProfile = newGenetic.terpeneProfile
        ? Object.fromEntries(
            Object.entries(newGenetic.terpeneProfile).map(([k, v]) => [
              k,
              Number(v),
            ])
          )
        : null

      const createdBy = {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? '',
        emailVerified: null,
        image: null,
        role: 'user' as const,
        active: true,
        permissions: null,
        preferences: null,
        lastLogin: null,
        createdAt: new Date(),
      }

      const optimisticGenetic = {
        ...createOptimisticGenetic(
          { ...newGenetic, terpeneProfile },
          createdBy
        ),
        plants: [] as Plant[],
        batches: [] as Batch[],
        _count: { plants: 0, batches: 0 },
        createdBy,
      } satisfies GeneticWithRelations

      utils.genetic.list.setData(undefined, (old) => {
        if (!old) return [optimisticGenetic]
        return [...old, optimisticGenetic]
      })

      return { previousData }
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        utils.genetic.list.setData(undefined, context.previousData)
      }
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    },
    onSettled: () => {
      void utils.genetic.list.invalidate()
    },
    onSuccess: (data) => {
      form.reset()
      toast({
        title: 'Success',
        description: 'Genetic created successfully',
      })
      onSuccess?.()
      router.push(`/genetics/${data?.slug}`)
    },
  })

  const updateGenetic = api.genetic.update.useMutation({
    onMutate: async ({ id, data }) => {
      await Promise.all([
        utils.genetic.getBySlug.cancel(),
        utils.genetic.list.cancel(),
      ])

      const previousData = {
        detail: genetic
          ? utils.genetic.getBySlug.getData(genetic.slug)
          : undefined,
        list: utils.genetic.list.getData(),
      }

      if (genetic) {
        utils.genetic.getBySlug.setData(genetic.slug, (old) => {
          if (!old) return undefined
          return {
            ...old,
            ...data,
            thcPotential: data.thcPotential?.toString() ?? old.thcPotential,
            cbdPotential: data.cbdPotential?.toString() ?? old.cbdPotential,
            plants: old.plants || [],
            batches: old.batches || [],
            _count: old._count || { plants: 0, batches: 0 },
          }
        })

        utils.genetic.list.setData(undefined, (old) => {
          if (!old) return undefined
          return old.map((g) =>
            g.id === id
              ? {
                  ...g,
                  ...data,
                  thcPotential: data.thcPotential?.toString() ?? g.thcPotential,
                  cbdPotential: data.cbdPotential?.toString() ?? g.cbdPotential,
                  plants: [],
                  batches: [],
                  _count: { plants: 0, batches: 0 },
                }
              : g
          )
        })
      }

      return previousData
    },
    onError: (err, newData, context) => {
      if (genetic) {
        utils.genetic.getBySlug.setData(genetic.slug, context?.detail)
      }
      utils.genetic.list.setData(undefined, context?.list)

      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Genetic updated successfully',
      })
      onSuccess?.()
    },
    onSettled: () => {
      void Promise.all([
        utils.genetic.getBySlug.invalidate(),
        utils.genetic.list.invalidate(),
      ])
    },
  })

  const form = useForm<GeneticFormData>({
    resolver: zodResolver(geneticFormSchema),
    defaultValues:
      mode === 'edit' && genetic
        ? {
            name: genetic.name,
            type: genetic.type,
            breeder: genetic.breeder,
            description: genetic.description,
            floweringTime: genetic.floweringTime,
            thcPotential: Number(genetic.thcPotential),
            cbdPotential: Number(genetic.cbdPotential),
            growthCharacteristics: genetic.growthCharacteristics,
            terpeneProfile: genetic.terpeneProfile
              ? Object.fromEntries(
                  Object.entries(genetic.terpeneProfile).map(([k, v]) => [
                    k,
                    Number(v),
                  ])
                )
              : null,
            lineage: genetic.lineage,
          }
        : {
            name: '',
            type: 'hybrid',
          },
  })

  const onSubmit = async (data: GeneticFormData) => {
    if (!session?.user) return

    const terpeneProfile = data.terpeneProfile
      ? Object.fromEntries(
          Object.entries(data.terpeneProfile).map(([k, v]) => [k, Number(v)])
        )
      : null

    if (mode === 'edit' && genetic) {
      await updateGenetic.mutate({
        id: genetic.id,
        data: {
          ...data,
          terpeneProfile,
        },
      })
    } else {
      await createMutation.mutate({
        ...data,
        terpeneProfile,
      })
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sativa">Sativa</SelectItem>
                  <SelectItem value="indica">Indica</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="breeder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breeder</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="floweringTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flowering Time (weeks)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : null
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
          name="thcPotential"
          render={({ field }) => (
            <FormItem>
              <FormLabel>THC Potential (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1.0"
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : null
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
          name="cbdPotential"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CBD Potential (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1.0"
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : null
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
          name="growthCharacteristics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Growth Characteristics</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={
                    field.value ? JSON.stringify(field.value, null, 2) : ''
                  }
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      field.onChange(parsed)
                    } catch {
                      field.onChange(e.target.value)
                    }
                  }}
                  placeholder="Enter growth characteristics as JSON"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createMutation.isPending || updateGenetic.isPending}
        >
          {createMutation.isPending || updateGenetic.isPending
            ? 'Saving...'
            : mode === 'edit'
              ? 'Save Changes'
              : 'Create Genetic'}
        </Button>
      </form>
    </Form>
  )
}
