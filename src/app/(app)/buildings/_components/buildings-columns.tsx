'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { type buildings } from '~/server/db/schema';
import { Badge } from '~/components/ui/badge';
import { format } from 'date-fns';
import { MoreHorizontal, Shield, Thermometer, Zap } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import Link from 'next/link';
import { api } from '~/trpc/react';
import { toast, useToast } from '../../../../hooks/use-toast';
import { useRouter } from 'next/navigation';

export const columns: ColumnDef<typeof buildings.$inferSelect>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const building = row.original;
      return (
        <Link href={`/buildings/${building.id}`} className="font-medium hover:underline">
          {building.name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'licenseNumber',
    header: 'License Number',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'properties',
    header: 'Properties',
    cell: ({ row }) => {
      const building = row.original;
      const props = building.properties;
      return (
        <div className="flex gap-2">
          {props?.climate && (
            <div
              className="flex items-center gap-1 text-sm"
              title={`Climate Control: ${props.climate.controlType}${props.climate.hvacSystem ? ` - ${props.climate.hvacSystem}` : ''}`}
            >
              <Thermometer className="h-4 w-4" />
            </div>
          )}
          {props?.security && (
            <div
              className="flex items-center gap-1 text-sm"
              title={`Security: ${props.security.accessControl ? 'Access Control, ' : ''}${props.security.cameraSystem ? 'Camera System' : ''}`}
            >
              <Shield className="h-4 w-4" />
            </div>
          )}
          {props?.power && (
            <div
              className="flex items-center gap-1 text-sm"
              title={`Power: ${props.power.mainSource}${props.power.backup ? ' + Backup' : ''}`}
            >
              <Zap className="h-4 w-4" />
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => {
      const building = row.original;
      return (
        <Link href={`/buildings/${building.id}`} className="hover:underline">
          {building.address?.city},{building.address?.country}
        </Link>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const building = row.original;
      const utils = api.useUtils();
      const { toast } = useToast();
      const router = useRouter();
      const { mutate: deleteBuilding } = api.building.delete.useMutation({
        onSuccess: () => {
          toast({ title: 'Building deleted successfully' });
          void utils.building.getAll.invalidate();
          router.refresh();
        },
        onError: (error) => {
          toast({
            title: 'Error deleting building',
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
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/buildings/${building.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/buildings/${building.id}/batches`}>View Batches</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this building?')) {
                  deleteBuilding(building.id);
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
