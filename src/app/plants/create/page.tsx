'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { api } from '~/trpc/react'
import { format } from 'date-fns'
import { useToast } from '~/hooks/use-toast'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { z } from 'zod'

const createPlantSchema = z.object({
  batchId: z.string().optional(),
  source: z.enum(['SEED', 'CLONE', 'MOTHER']),
  stage: z.enum(['SEEDLING', 'VEGETATIVE', 'FLOWERING']),
  plantDate: z.date(),
  healthStatus: z
    .enum(['HEALTHY', 'SICK', 'PEST', 'NUTRIENT'])
    .default('HEALTHY'),
  quarantine: z.boolean().default(false),
  geneticId: z.number().optional(),
  motherId: z.number().optional(),
  generation: z.number().optional(),
  sex: z.enum(['MALE', 'FEMALE', 'HERMAPHRODITE', 'UNKNOWN']).optional(),
  phenotype: z.string().optional(),
  locationId: z.number().optional(),
  destroyReason: z.string().optional(),
})

type CreatePlantInput = z.infer<typeof createPlantSchema>

export default function CreatePlant() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<CreatePlantInput>({
    resolver: zodResolver(createPlantSchema),
    defaultValues: {
      batchId: '',
      source: 'SEED',
      stage: 'SEEDLING',
      plantDate: new Date(),
      healthStatus: 'HEALTHY',
      quarantine: false,
    },
  })

  const createPlant = api.plant.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Plant created successfully',
      })
      router.push('/plants')
      router.refresh()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  function onSubmit(data: CreatePlantInput) {
    createPlant.mutate(data)
  }

  return (
    <main className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Plant</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Batch ID */}
              <FormField
                control={form.control}
                name="batchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter batch ID" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional identifier for batch tracking
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="SEED">Seed</SelectItem>
                        <SelectItem value="CLONE">Clone</SelectItem>
                        <SelectItem value="MOTHER">Mother</SelectItem>
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
                        <SelectItem value="SEEDLING">Seedling</SelectItem>
                        <SelectItem value="VEGETATIVE">Vegetative</SelectItem>
                        <SelectItem value="FLOWERING">Flowering</SelectItem>
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
                          field.value ? format(field.value, 'yyyy-MM-dd') : ''
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

              {/* Health Status */}
              <FormField
                control={form.control}
                name="healthStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select health status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HEALTHY">Healthy</SelectItem>
                        <SelectItem value="SICK">Sick</SelectItem>
                        <SelectItem value="PEST">Pest Issue</SelectItem>
                        <SelectItem value="NUTRIENT">Nutrient Issue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={createPlant.isPending}
              >
                {createPlant.isPending ? 'Adding...' : 'Add Plant'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  )
}
