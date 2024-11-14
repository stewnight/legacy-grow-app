'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type NewBatch, insertBatchSchema } from '~/server/db/schema'
import {
  batchStatusEnum,
  plantStageEnum,
  plantSexEnum,
  healthStatusEnum,
} from '~/server/db/schema'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { genetics } from '~/server/db/schema'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from '~/components/ui/select'
import { addDays, format } from 'date-fns'
import { Textarea } from '~/components/ui/textarea'
import { api } from '~/trpc/react'
import Link from 'next/link'
import { CalendarIcon } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Calendar } from '../../../components/ui/calendar'
import { cn } from '../../../lib/utils'
import { z } from 'zod'

interface BatchFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<NewBatch>
}

export function BatchesForm({ mode, initialData }: BatchFormProps) {
  const form = useForm<NewBatch>({
    resolver: zodResolver(insertBatchSchema),
    defaultValues: {
      name:
        initialData?.name ??
        `Batch-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${new Date().getTime().toString().slice(-4)}`,
      status: initialData?.status ?? 'active',
      plantCount: initialData?.plantCount ?? 1,
      geneticId: initialData?.geneticId,
      source: initialData?.source ?? 'seed',
      stage: initialData?.stage ?? 'seedling',
      plantDate: initialData?.plantDate,
      healthStatus: initialData?.healthStatus ?? 'healthy',
      sex: initialData?.sex ?? 'female',
      phenotype: initialData?.phenotype ?? '',
      notes: initialData?.notes ?? '',
      locationId: initialData?.locationId,
      motherId: initialData?.motherId,
      generation: initialData?.generation,
    },
  })

  const genetics = api.genetic.getAll.useQuery({
    limit: 100,
  })

  async function onSubmit(values: z.infer<typeof insertBatchSchema>) {
    console.log(values)
    const result = await api.batch.create.useMutation().mutateAsync(values)
    console.log(result)
    return Promise.resolve()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-10rem)] px-2"
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
              {genetics.data && genetics.data.items.length > 0 ? (
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
                    {genetics.data.items.map((genetic) => (
                      <SelectItem
                        key={genetic.id}
                        value={genetic.id.toString()}
                      >
                        {genetic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Please make sure you have created some{' '}
                  <Link href="/genetics" className="underline">
                    genetics
                  </Link>{' '}
                  first.
                </div>
              )}
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
                  {Object.values(plantStageEnum.enumValues).map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
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
          name="plantDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Plant Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                  <Select
                    onValueChange={(value) =>
                      field.onChange(addDays(new Date(), parseInt(value)))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="0">Today</SelectItem>
                      <SelectItem value="1">Tomorrow</SelectItem>
                      <SelectItem value="3">In 3 days</SelectItem>
                      <SelectItem value="7">In a week</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="rounded-md border">
                    <Calendar
                      mode="single"
                      selected={field.value ? field.value : undefined}
                      onSelect={field.onChange}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Batch start date from any growth stage or source.
              </FormDescription>
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
                  {Object.values(batchStatusEnum.enumValues).map((status) => (
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

        <div className="col-span-full flex gap-2 justify-end">
          <Button type="submit">
            {initialData ? 'Save Changes' : 'Create Batch'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
