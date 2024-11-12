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
import { type Genetic, type Plant, type Batch } from '~/server/db/schema'
import { BaseSheet } from '~/components/base-sheet'
import { GeneticForm } from './genetic-form'

interface GeneticActionsProps {
  genetic: Genetic & {
    plants: Plant[]
    batches: Batch[]
    _count?: {
      plants: number
      batches: number
    }
  }
}

export function GeneticActions({ genetic }: GeneticActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const utils = api.useUtils()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)

  const deleteGenetic = api.genetic.delete.useMutation({
    onMutate: async () => {
      await utils.genetic.list.cancel()
      const previousGenetics = utils.genetic.list.getData()

      utils.genetic.list.setData(undefined, (old) =>
        old?.filter((g) => g.id !== genetic.id)
      )

      return { previousGenetics }
    },
    onError: (err, _, context) => {
      if (context?.previousGenetics) {
        utils.genetic.list.setData(undefined, context.previousGenetics)
      }
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Genetic deleted successfully',
      })
      router.push('/genetics')
    },
    onSettled: () => {
      void utils.genetic.list.invalidate()
    },
  })

  const updateMutation = api.genetic.update.useMutation({
    onMutate: async (updatedGenetic) => {
      await utils.genetic.getBySlug.cancel(genetic.slug)
      const previousData = utils.genetic.getBySlug.getData(genetic.slug)

      utils.genetic.getBySlug.setData(genetic.slug, (old) => {
        if (!old) return old
        return updateOptimisticEntity(old, updatedGenetic)
      })

      return { previousData }
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        utils.genetic.getBySlug.setData(genetic.slug, context.previousData)
      }
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    },
    onSettled: () => {
      void utils.genetic.getBySlug.invalidate()
    },
  })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditSheetOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Genetic
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Genetic
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <GeneticSheet
        mode="edit"
        genetic={{
          ...genetic,
          plants: genetic.plants || [],
          batches: genetic.batches || [],
          _count: genetic._count || { plants: 0, batches: 0 },
        }}
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
      /> */}
      <BaseSheet
        mode="edit"
        title="Genetic"
        description="genetic strain"
        entity={{
          ...genetic,
          plants: genetic.plants || [],
          batches: genetic.batches || [],
          _count: genetic._count || { plants: 0, batches: 0 },
        }}
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
      >
        <GeneticForm mode="edit" />
      </BaseSheet>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Genetic</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this genetic strain? This action
              cannot be undone. Any plants or batches using this genetic will
              prevent deletion.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteGenetic.mutate({ id: genetic.id })
                setIsDeleteDialogOpen(false)
              }}
            >
              Delete Genetic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
