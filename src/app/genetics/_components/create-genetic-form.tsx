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
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'
import { SheetClose } from '~/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

const createGeneticSchema = z.object({
  name: z.string().min(1, 'Genetic name is required'),
  type: z.enum(['sativa', 'indica', 'hybrid'], {
    required_error: 'Type is required',
  }),
  breeder: z.string().optional(),
  description: z.string().optional(),
  floweringTime: z.number().min(1).max(20).optional(),
  thcPotential: z.number().min(0).max(35).optional(),
  cbdPotential: z.number().min(0).max(35).optional(),
  terpeneProfie: z.record(z.string(), z.number()).optional(),
  growthCharacteristics: z
    .object({
      height: z.number().optional(),
      spread: z.number().optional(),
      internodeSpacing: z.number().optional(),
      leafPattern: z.string().optional(),
    })
    .optional(),
  lineage: z
    .object({
      mother: z.string().optional(),
      father: z.string().optional(),
      generation: z.number().optional(),
    })
    .optional(),
})

export function CreateGeneticForm() {
  const router = useRouter()
  const utils = api.useUtils()
  const form = useForm<z.infer<typeof createGeneticSchema>>({
    resolver: zodResolver(createGeneticSchema),
    defaultValues: {
      name: '',
      type: undefined,
      description: '',
      floweringTime: undefined,
      thcPotential: undefined,
      cbdPotential: undefined,
    },
  })

  const createGenetic = api.genetic.create.useMutation({
    onMutate: async (newGenetic) => {
      // Cancel outgoing refetches
      await utils.genetic.list.cancel()

      // Snapshot the previous value
      const previousGenetics = utils.genetic.list.getData()

      // Optimistically update the list
      utils.genetic.list.setData(undefined, (old) => {
        if (!old) return [newGenetic]
        return [...old, newGenetic]
      })

      return { previousGenetics }
    },
    onError: (err, newGenetic, context) => {
      // Roll back on error
      utils.genetic.list.setData(undefined, context?.previousGenetics)
    },
    onSettled: () => {
      // Sync with server after error or success
      void utils.genetic.list.invalidate()
    },
  })

  async function onSubmit(values: z.infer<typeof createGeneticSchema>) {
    try {
      await createGenetic.mutateAsync(values)
      const sheetClose = document.querySelector(
        '[data-sheet-close]'
      ) as HTMLButtonElement
      sheetClose?.click()
    } catch (error) {
      console.error('Failed to create genetic:', error)
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
                <Input placeholder="Strain name" {...field} />
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
                    <SelectValue placeholder="Select type" />
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the strain characteristics"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-3">
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                <FormLabel>THC %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
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
            name="cbdPotential"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CBD %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <SheetClose asChild data-sheet-close>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
          <Button type="submit" disabled={createGenetic.isPending}>
            {createGenetic.isPending ? 'Creating...' : 'Create Genetic'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
