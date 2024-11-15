'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insertGeneticSchema, Session } from '~/server/db/schema'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '~/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { type z } from 'zod'
import { geneticTypeEnum } from '~/server/db/schema/enums'
import { type inferRouterOutputs } from '@trpc/server'
import { type AppRouter } from '~/server/api/root'
import { Checkbox } from '@/components/ui/checkbox'
import { api } from '../../../trpc/react'

type RouterOutputs = inferRouterOutputs<AppRouter>
type GeneticFormValues = z.infer<typeof insertGeneticSchema>

interface GeneticFormProps {
  mode?: 'create' | 'edit'
  defaultValues?: RouterOutputs['genetic']['get']
  onSuccess?: (data: GeneticFormValues) => void
  session: Session
}

export function GeneticForm({
  mode = 'create',
  defaultValues,
  session,
  onSuccess,
}: GeneticFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = api.useUtils()
  const form = useForm<GeneticFormValues>({
    resolver: zodResolver(insertGeneticSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      type: defaultValues?.type || 'hybrid',
      breeder: defaultValues?.breeder || '',
      description: defaultValues?.description || '',
      inHouse: defaultValues?.inHouse || false,
      status: defaultValues?.status || 'active',
      createdById: defaultValues?.createdById || session.userId,
    },
  })

  const { mutate: createGenetic, isPending: isCreating } =
    api.genetic.create.useMutation({
      onSuccess: (data) => {
        toast({ title: 'Genetic created successfully' })
        void utils.genetic.getAll.invalidate()
        onSuccess?.(data)
      },
      onError: (error) => {
        toast({
          title: 'Error creating genetic',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateGenetic, isPending: isUpdating } =
    api.genetic.update.useMutation({
      onSuccess: (data) => {
        toast({ title: 'Genetic updated successfully' })
        void utils.genetic.getAll.invalidate()
        onSuccess?.(data)
      },
      onError: (error) => {
        toast({
          title: 'Error updating genetic',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  function onSubmit(values: GeneticFormValues) {
    const userId = session?.userId
    if (!userId) {
      console.error('User ID is missing.')
      return
    }

    console.log('User ID:', userId)

    console.log('Form Submitted:', values)
    const dataWithUserId = { ...values, createdById: userId }

    if (mode === 'create') {
      console.log('Creating Genetic')
      createGenetic(dataWithUserId)
    } else if (defaultValues?.id) {
      console.log('Updating Genetic')
      updateGenetic({ id: defaultValues.id, data: dataWithUserId })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          console.log('Form Submitted Event')
          form.handleSubmit(onSubmit, (errors) => {
            console.log('Form Errors:', errors)
          })(e)
        }}
        className="space-y-4"
        noValidate
      >
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
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {geneticTypeEnum.enumValues.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
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
          name="breeder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breeder</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
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
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inHouse"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>In House</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isCreating || isUpdating}>
          {mode === 'create' ? 'Create Genetic' : 'Update Genetic'}
        </Button>
      </form>
    </Form>
  )
}
