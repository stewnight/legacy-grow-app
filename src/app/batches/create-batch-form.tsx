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
import { Card, CardContent } from '~/components/ui/card'

const batchSchema = z.object({
  name: z.string().min(1, 'Batch name is required'),
  strain: z.string().min(1, 'Strain name is required'),
  plantCount: z.number().min(1, 'Must have at least 1 plant'),
  notes: z.string().optional(),
  // Plant details
  source: z.enum(['seed', 'clone', 'mother']),
  stage: z.enum(['seedling', 'vegetative', 'flowering']),
  plantDate: z.date(),
  healthStatus: z
    .enum(['healthy', 'sick', 'pest', 'nutrient'])
    .default('healthy'),
  geneticId: z.number().optional(),
  motherId: z.number().optional(),
  generation: z.number().optional(),
  sex: z.enum(['male', 'female', 'hermaphrodite', 'unknown']).optional(),
  phenotype: z.string().optional(),
  locationId: z.number().optional(),
})

type BatchInput = z.infer<typeof batchSchema>

export function CreateBatchForm() {
  const router = useRouter()

  const form = useForm<BatchInput>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: '',
      source: 'clone',
      stage: 'seedling',
      plantDate: new Date(),
      healthStatus: 'healthy',
      plantCount: 1,
    },
  })

  const createBatch = api.batch.create.useMutation({
    onSuccess: () => {
      form.reset()
      router.refresh()
    },
  })

  function onSubmit(data: BatchInput) {
    createBatch.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Batch Details */}
              <div className="space-y-4">
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
                  name="strain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strain</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter strain name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plantCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Plants</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          min={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-4 font-medium">Plant Details</h3>
                <div className="space-y-4">
                  {/* Source */}
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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

                  {/* Stage */}
                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stage</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="seedling">Seedling</SelectItem>
                            <SelectItem value="vegetative">
                              Vegetative
                            </SelectItem>
                            <SelectItem value="flowering">Flowering</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Plant Date */}
                  <FormField
                    control={form.control}
                    name="plantDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plant Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={
                              field.value
                                ? new Date(field.value)
                                    .toISOString()
                                    .split('T')[0]
                                : ''
                            }
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Optional notes about the batch"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full"
          disabled={createBatch.isPending}
        >
          {createBatch.isPending ? 'Creating...' : 'Create Batch'}
        </Button>
      </form>
    </Form>
  )
}
