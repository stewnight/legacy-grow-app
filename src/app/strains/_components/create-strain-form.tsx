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
import { CardContent } from '~/components/ui/card'
import { useToast } from '~/hooks/use-toast'

const strainSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['sativa', 'indica', 'hybrid']),
  description: z.string().optional(),
  floweringTime: z.number().min(1).max(52).optional(),
  thcPotential: z.number().min(0).max(100).optional(),
  cbdPotential: z.number().min(0).max(100).optional(),
})

type StrainInput = z.infer<typeof strainSchema>

export function CreateStrainForm() {
  const { toast } = useToast()
  const utils = api.useUtils()

  const form = useForm<StrainInput>({
    resolver: zodResolver(strainSchema),
    defaultValues: {
      name: '',
      type: 'hybrid',
    },
  })

  const createStrain = api.strain.create.useMutation({
    onSuccess: () => {
      form.reset()
      void utils.strain.list.invalidate()
      toast({
        title: 'Success',
        description: 'Strain created successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  function onSubmit(data: StrainInput) {
    createStrain.mutate(data)
  }

  return (
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter strain name" />
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
                  <Textarea {...field} placeholder="Enter strain description" />
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

          <Button
            type="submit"
            className="w-full"
            disabled={createStrain.isPending}
          >
            {createStrain.isPending ? 'Creating...' : 'Create Strain'}
          </Button>
        </form>
      </Form>
    </CardContent>
  )
}
