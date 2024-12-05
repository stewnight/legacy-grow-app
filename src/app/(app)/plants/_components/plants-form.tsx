'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertPlantSchema, type Plant } from '~/server/db/schema';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type z } from 'zod';
import {
  plantStageEnum,
  plantSourceEnum,
  plantSexEnum,
  healthStatusEnum,
} from '~/server/db/schema/enums';
import { type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '~/server/api/root';
import { api } from '~/trpc/react';
import { useToast } from '~/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type PlantFormValues = z.infer<typeof insertPlantSchema>;
type PlantProperties = {
  height: number;
  width: number;
  feeding: {
    schedule: string;
  };
};

interface PlantFormProps {
  mode?: 'create' | 'edit';
  defaultValues?: RouterOutputs['plant']['get'];
  onSuccess?: (data: PlantFormValues) => void;
}

export function PlantForm({ mode = 'create', defaultValues, onSuccess }: PlantFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();

  const createDefaultProperties = (): PlantProperties => ({
    height: 0,
    width: 0,
    feeding: { schedule: 'daily' },
  });

  const form = useForm<PlantFormValues>({
    resolver: zodResolver(insertPlantSchema),
    defaultValues: {
      identifier: defaultValues?.identifier ?? '',
      geneticId: defaultValues?.geneticId ?? '',
      locationId: defaultValues?.locationId ?? '',
      batchId: defaultValues?.batchId ?? undefined,
      motherId: defaultValues?.motherId ?? undefined,
      source: defaultValues?.source ?? plantSourceEnum.enumValues[0],
      stage: defaultValues?.stage ?? plantStageEnum.enumValues[0],
      sex: defaultValues?.sex ?? plantSexEnum.enumValues[0],
      health: defaultValues?.health ?? healthStatusEnum.enumValues[0],
      plantedDate: defaultValues?.plantedDate ?? undefined,
    },
  });

  // Fetch related data
  const { data: genetics } = api.genetic.getAll.useQuery({
    limit: 100,
    filters: { status: 'active' },
  });

  const { data: locations } = api.location.getAll.useQuery({
    limit: 100,
    filters: { status: 'active' },
  });

  const { data: batches } = api.batch.getAll.useQuery({
    limit: 100,
    filters: { status: 'active' },
  });

  const { data: mothers } = api.plant.getAll.useQuery({
    limit: 100,
    filters: { status: 'active' },
  });

  const { mutate: createPlant, isPending: isCreating } = api.plant.create.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Plant created successfully' });
      void Promise.all([utils.plant.getAll.invalidate(), utils.plant.get.invalidate(data.id)]);
      router.push(`/plants/${data.id}`);
      onSuccess?.(data);
    },
    onError: (error) => {
      toast({
        title: 'Error creating plant',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const { mutate: updatePlant, isPending: isUpdating } = api.plant.update.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Plant updated successfully' });
      void Promise.all([utils.plant.getAll.invalidate(), utils.plant.get.invalidate(data.id)]);
      onSuccess?.(data);
    },
    onError: (error) => {
      toast({
        title: 'Error updating plant',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: PlantFormValues) {
    if (mode === 'create') {
      createPlant(values);
    } else if (defaultValues?.id) {
      updatePlant({ id: defaultValues.id, data: values });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifier</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genetic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genetics?.items.map((genetic) => (
                    <SelectItem key={genetic.id} value={genetic.id}>
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
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations?.items.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
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
          name="batchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Batch (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {batches?.items.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.identifier}
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
          name="motherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mother Plant (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mother plant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {mothers?.items.map((mother) => (
                    <SelectItem key={mother.id} value={mother.id}>
                      {mother.identifier}
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
                  {plantSourceEnum.enumValues.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source.charAt(0).toUpperCase() + source.slice(1)}
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
                  {plantStageEnum.enumValues.map((stage) => (
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
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sex</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {plantSexEnum.enumValues.map((sex) => (
                    <SelectItem key={sex} value={sex}>
                      {sex.charAt(0).toUpperCase() + sex.slice(1)}
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
          name="health"
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
                  {healthStatusEnum.enumValues.map((status) => (
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

        <FormField
          control={form.control}
          name="plantedDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Planted Date</FormLabel>
              <DatePicker
                date={field.value ? new Date(field.value) : null}
                onDateChange={(date) => field.onChange(date ?? null)}
              />
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
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isCreating || isUpdating}>
          {mode === 'create' ? 'Create Plant' : 'Update Plant'}
        </Button>
      </form>
    </Form>
  );
}
