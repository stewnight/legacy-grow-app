'use client'

import { useState } from 'react'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'
import { useToast } from '~/hooks/use-toast'
import { updateOptimisticEntity } from '~/lib/optimistic-update'
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
import { BatchSheet } from './batch-sheet'
import { type BatchWithRelations } from '~/lib/validations/batch'

interface BatchActionsProps {
  batch: BatchWithRelations
}

export function BatchActions({ batch }: BatchActionsProps) {
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const utils = api.useUtils()

  const deleteMutation = api.batch.delete.useMutation({
    onMutate: async () => {
      await utils.batch.list.cancel()
      const previousData = utils.batch.list.getData()

      utils.batch.list.setData(undefined, (old) => {
        if (!old) return []
        return old.filter((item) => item.code !== batch.code)
      })

      return { previousData }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Batch deleted successfully',
      })
      router.push('/batches')
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        utils.batch.list.setData(undefined, context.previousData)
      }
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    },
    onSettled: () => {
      void utils.batch.list.invalidate()
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

      <BatchSheet
        mode="edit"
        batch={batch}
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Batch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this batch? This action cannot be
              undone.
              {batch.plants.length > 0 && (
                <p className="mt-2 text-red-500">
                  Warning: This batch has {batch.plants.length} active plants.
                  Please remove or transfer them before deleting.
                </p>
              )}
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
                deleteMutation.mutate({ code: batch.code! })
                setShowDeleteDialog(false)
              }}
              disabled={batch.plants.length > 0}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
