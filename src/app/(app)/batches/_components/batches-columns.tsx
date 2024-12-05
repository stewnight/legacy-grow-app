'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { type batches } from '~/server/db/schema';
import { Badge } from '~/components/ui/badge';
import { MoreHorizontal, Calendar, Leaf, MapPin } from 'lucide-react';
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
import { format } from 'date-fns';

// Define the type including relations
type BatchWithRelations = typeof batches.$inferSelect & {
  genetic?: {
    id: string;
    name: string;
  } | null;
  location?: {
    id: string;
    name: string;
  } | null;
};

export const columns: ColumnDef<BatchWithRelations>[] = [
  {
    accessorKey: 'identifier',
    header: 'Identifier',
    cell: ({ row }) => {
      const batch = row.original;
      return (
        <Link href={`/batches/${batch.id}`} className="font-medium hover:underline">
          {batch.identifier}
        </Link>
      );
    },
  },
  {
    accessorKey: 'genetic',
    header: 'Genetic',
    cell: ({ row }) => {
      const batch = row.original;
      return batch.genetic ? (
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-muted-foreground" />
          <Link href={`/genetics/${batch.genetic.id}`} className="hover:underline">
            {batch.genetic.name}
          </Link>
        </div>
      ) : (
        'N/A'
      );
    },
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => {
      const batch = row.original;
      return batch.location ? (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <Link href={`/locations/${batch.location.id}`} className="hover:underline">
            {batch.location.name}
          </Link>
        </div>
      ) : (
        'N/A'
      );
    },
  },
  {
    accessorKey: 'stage',
    header: 'Stage',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('stage')}</Badge>;
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }) => {
      const date = row.getValue('startDate');
      if (!date) return null;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {format(new Date(date as string), 'PP')}
        </div>
      );
    },
  },
  {
    accessorKey: 'plantCount',
    header: 'Plants',
  },
  {
    accessorKey: 'batchStatus',
    header: 'Status',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('batchStatus')}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const batch = row.original;
      const utils = api.useUtils();
      const { toast } = useToast();

      const { mutate: deleteBatch } = api.batch.delete.useMutation({
        onSuccess: () => {
          toast({ title: 'Batch deleted successfully' });
          void utils.batch.getAll.invalidate();
        },
        onError: (error) => {
          toast({
            title: 'Error deleting batch',
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
              <Link href={`/batches/${batch.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this batch?')) {
                  deleteBatch(batch.id);
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
