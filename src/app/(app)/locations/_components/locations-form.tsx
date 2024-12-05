'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertLocationSchema } from '~/server/db/schema';
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
import { locationTypeEnum } from '~/server/db/schema/enums';
import { type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '~/server/api/root';
import { api } from '~/trpc/react';
import { useToast } from '~/hooks/use-toast';
import { useRouter } from 'next/navigation';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type LocationFormValues = z.infer<typeof insertLocationSchema>;
type LocationDimensions = {
  length: number;
  width: number;
  height: number;
  unit: 'm' | 'ft';
};

type LocationProperties = {
  temperature: { min: number; max: number };
  humidity: { min: number; max: number };
  light: { type: string; intensity: number };
  co2: { min: number; max: number };
};

interface LocationFormProps {
  mode?: 'create' | 'edit';
  defaultValues?: RouterOutputs['location']['get'];
  onSuccess?: (data: LocationFormValues) => void;
}

export function LocationForm({ mode = 'create', defaultValues, onSuccess }: LocationFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();

  const createDefaultProperties = (): LocationProperties => ({
    temperature: { min: 15, max: 30 },
    humidity: { min: 40, max: 60 },
    light: { type: 'LED', intensity: 100 },
    co2: { min: 400, max: 1500 },
  });

  const createDefaultDimensions = (): LocationDimensions => ({
    length: 10,
    width: 10,
    height: 8,
    unit: 'm',
  });

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(insertLocationSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      type: defaultValues?.type ?? locationTypeEnum.enumValues[0],
    },
  });

  const { mutate: createLocation, isPending: isCreating } = api.location.create.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Location created successfully' });
      void Promise.all([
        utils.location.getAll.invalidate(),
        utils.location.get.invalidate(data.id),
      ]);
      router.push(`/locations/${data.id}`);
      onSuccess?.(data);
    },
    onError: (error) => {
      toast({
        title: 'Error creating location',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const { mutate: updateLocation, isPending: isUpdating } = api.location.update.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Location updated successfully' });
      void Promise.all([
        utils.location.getAll.invalidate(),
        utils.location.get.invalidate(data.id),
      ]);
      onSuccess?.(data);
    },
    onError: (error) => {
      toast({
        title: 'Error updating location',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: LocationFormValues) {
    if (mode === 'create') {
      createLocation(values);
    } else if (defaultValues?.id) {
      updateLocation({ id: defaultValues.id, data: values });
    }
  }

  const { data: rooms } = api.room.getAll.useQuery({
    limit: 100,
    filters: { status: 'active' },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          form.handleSubmit(onSubmit, (errors) => {
            console.log('Form Errors:', errors);
          })(e);
        }}
        className="space-y-4 p-1"
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
                  {locationTypeEnum.enumValues.map((type) => (
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
          name="roomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms?.items.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Environmental Properties */}
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-medium">Environmental Settings</h4>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="properties.temperature.min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Temperature</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value?.toString() ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="properties.temperature.max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Temperature</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value?.toString() ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="properties.humidity.min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Humidity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value?.toString() ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="properties.humidity.max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Humidity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value?.toString() ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-medium">Dimensions</h4>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dimensions.length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value?.toString() ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dimensions.width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value?.toString() ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="dimensions.height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value?.toString() ?? ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dimensions.unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="m">Meters</SelectItem>
                    <SelectItem value="ft">Feet</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value?.toString() ?? ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
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
          {mode === 'create' ? 'Create Location' : 'Update Location'}
        </Button>
      </form>
    </Form>
  );
}
