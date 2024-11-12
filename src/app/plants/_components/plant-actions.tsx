'use client'

import { useState } from 'react'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'
import { useToast } from '~/hooks/use-toast'
import { MoreHorizontal, Trash2, Pencil } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { BaseSheet } from '../../../components/base-sheet'
import { PlantForm } from './plant-form'
import { Plant, Genetic, Batch } from '../../../server/db/schemas'

interface PlantActionsProps {
  plant: Plant & {
    genetic: Genetic
    batch: Batch
  }
}

export function PlantActions({ plant }: PlantActionsProps) {
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const utils = api.useUtils()

  const deleteMutation = api.plant.delete.useMutation({
    onMutate: async () => {
      await utils.plant.list.cancel()
      const previousData = utils.plant.list.getData({
        filters: plant.batchId ? { batchId: plant.batchId } : undefined,
      })

      utils.plant.list.setData(
        { filters: plant.batchId ? { batchId: plant.batchId } : undefined },
        (old) => {
          if (!old) return []
          return old.filter((item) => item.code !== plant.code)
        }
      )

      return { previousData }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Plant deleted successfully',
      })
      router.refresh()
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        utils.plant.list.setData(
          { filters: plant.batchId ? { batchId: plant.batchId } : undefined },
          context.previousData
        )
      }
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditSheet(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BaseSheet mode="edit" title="Edit Plant" description="Edit a plant">
        <PlantForm mode="edit" />
      </BaseSheet>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this plant? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate({ code: plant.code })
                setShowDeleteDialog(false)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
