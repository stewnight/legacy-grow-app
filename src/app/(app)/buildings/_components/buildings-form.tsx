'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertBuildingSchema, buildingTypeEnum, statusEnum } from '~/server/db/schema';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '~/components/ui/form';
import { useToast } from '~/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/react';
import { type z } from 'zod';
import { type AppRouter } from '~/server/api/root';
import { inferRouterOutputs } from '@trpc/server';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type BuildingFormValues = z.infer<typeof insertBuildingSchema>;
type BuildingProperties = z.infer<typeof insertBuildingSchema.shape.properties>;
type BuildingAddress = z.infer<typeof insertBuildingSchema.shape.address>;

interface BuildingFormProps {
  mode: 'create' | 'edit';
  defaultValues?: RouterOutputs['building']['get'];
  onSuccess?: (data: BuildingFormValues) => void;
}

export function BuildingsForm({ mode = 'create', defaultValues, onSuccess }: BuildingFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();

  const defaultProperties: BuildingProperties = defaultValues?.properties ?? {
    climate: {
      controlType: 'manual',
      hvacSystem: '',
    },
    security: {
      accessControl: false,
      cameraSystem: false,
    },
    power: {
      mainSource: '',
      backup: false,
    },
  };

  const defaultAddress: BuildingAddress = defaultValues?.address ?? {
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
  };

  const form = useForm<BuildingFormValues>({
    resolver: zodResolver(insertBuildingSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      type: defaultValues?.type ?? buildingTypeEnum.enumValues[0],
      status: defaultValues?.status ?? statusEnum.enumValues[0],
      address: defaultAddress,
      properties: defaultProperties,
    },
  });

  const { mutate: createBuilding, isPending: isCreating } = api.building.create.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Building created successfully' });
      void Promise.all([
        utils.building.getAll.invalidate(),
        utils.building.get.invalidate(data.id),
      ]);
      router.push(`/buildings/${data.id}`);
      onSuccess?.(data);
    },
    onError: (error) => {
      toast({
        title: 'Error creating building',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const { mutate: updateBuilding, isPending: isUpdating } = api.building.update.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Building updated successfully' });
      void Promise.all([
        utils.building.getAll.invalidate(),
        utils.building.get.invalidate(data.id),
      ]);
      onSuccess?.(data);
    },
    onError: (error) => {
      toast({
        title: 'Error updating building',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  async function onSubmit(values: BuildingFormValues) {
    if (mode === 'create') {
      createBuilding(values);
    } else if (defaultValues?.id) {
      updateBuilding({ id: defaultValues.id, data: values });
    }
  }

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
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="licenseNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Number</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildingTypeEnum.enumValues.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">Address Information</h3>

          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={
                      typeof field.value === 'string' || typeof field.value === 'number'
                        ? field.value
                        : ''
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        typeof field.value === 'string' || typeof field.value === 'number'
                          ? field.value
                          : ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        typeof field.value === 'string' || typeof field.value === 'number'
                          ? field.value
                          : ''
                      }
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
              name="address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        typeof field.value === 'string' || typeof field.value === 'number'
                          ? field.value
                          : ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        typeof field.value === 'string' || typeof field.value === 'number'
                          ? field.value
                          : ''
                      }
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
              name="address.coordinates.latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      value={
                        typeof field.value === 'number' ? field.value : Number(field.value) || 0
                      }
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.coordinates.longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      value={
                        typeof field.value === 'number' ? field.value : Number(field.value) || 0
                      }
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <h3 className="font-medium">Building Properties</h3>

        {/* Climate Properties */}
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-medium">Climate</h4>
          <FormField
            control={form.control}
            name="properties.climate.controlType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Control Type</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select control type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automated">Automated</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="properties.climate.hvacSystem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HVAC System</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value as string} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Security Properties */}
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-medium">Security</h4>
          <FormField
            control={form.control}
            name="properties.security.accessControl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Control</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'true')}
                    defaultValue={field.value?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select access control" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="properties.security.cameraSystem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Camera System</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'true')}
                    defaultValue={field.value?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select camera system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Power Properties */}
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-medium">Power</h4>
          <FormField
            control={form.control}
            name="properties.power.mainSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Power Source</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value as string} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="properties.power.backup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Backup Power</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'true')}
                    defaultValue={field.value?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select backup power" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  {statusEnum.enumValues.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isCreating || isUpdating}>
          {mode === 'create' ? 'Create Building' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
