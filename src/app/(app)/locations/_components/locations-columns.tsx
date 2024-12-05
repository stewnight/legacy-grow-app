'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { type locations } from '~/server/db/schema';
import { Badge } from '~/components/ui/badge';
import { MoreHorizontal, Thermometer, Droplets } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import Link from 'next/link';
import { api } from '~/trpc/react';
import { useToast } from '~/hooks/use-toast';

export const columns: ColumnDef<typeof locations.$inferSelect>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const location = row.original;
      return (
        <Link href={`/locations/${location.id}`} className="font-medium hover:underline">
          {location.name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('type')}</Badge>;
    },
  },
  {
    accessorKey: 'capacity',
    header: 'Capacity',
  },
  {
    accessorKey: 'properties',
    header: 'Environment',
    cell: ({ row }) => {
      const location = row.original;
      const props = location.properties;
      return (
        <div className="flex gap-2">
          {props?.temperature && (
            <div
              className="flex items-center gap-1 text-sm"
              title={`Temperature: ${props.temperature.min}° - ${props.temperature.max}°`}
            >
              <Thermometer className="h-4 w-4" />
            </div>
          )}
          {props?.humidity && (
            <div
              className="flex items-center gap-1 text-sm"
              title={`Humidity: ${props.humidity.min}% - ${props.humidity.max}%`}
            >
              <Droplets className="h-4 w-4" />
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('status')}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const location = row.original;
      const utils = api.useUtils();
      const { toast } = useToast();

      const { mutate: deleteLocation } = api.location.delete.useMutation({
        onSuccess: () => {
          toast({ title: 'Location deleted successfully' });
          void utils.location.getAll.invalidate();
        },
        onError: (error) => {
          toast({
            title: 'Error deleting location',
            description: error.message,
            variant: 'destructive',
          });
        },
      });

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/locations/${location.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this location?')) {
                  deleteLocation(location.id);
                }
              }}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
