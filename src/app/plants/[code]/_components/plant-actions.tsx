'use client'

import { MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { type Plant } from '~/server/db/schemas/cultivation'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '~/hooks/use-toast'

export function PlantActions({ plant }: { plant: Plant }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [destroyReason, setDestroyReason] = useState('')

  const updatePlant = api.plant.update.useMutation({
    onSuccess: () => {
      router.refresh()
    },
  })

  const deletePlant = api.plant.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Plant deleted',
        description: 'The plant has been successfully deleted.',
      })
      router.push('/plants')
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
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
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              updatePlant.mutate({
                id: plant.id,
                quarantine: !plant.quarantine,
              })
            }
          >
            {plant.quarantine ? 'Remove from Quarantine' : 'Mark as Quarantined'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              updatePlant.mutate({
                id: plant.id,
                stage:
                  plant.stage === 'seedling'
                    ? 'vegetative'
                    : plant.stage === 'vegetative'
                      ? 'flowering'
                      : 'harvested',
              })
            }
          >
            Advance Growth Stage
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Plant
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this plant? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for deletion (optional)</Label>
              <Input
                id="reason"
                value={destroyReason}
                onChange={(e) => setDestroyReason(e.target.value)}
                placeholder="Enter reason..."
              />
            </div>
          </div>
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
                deletePlant.mutate({
                  id: plant.id,
                  destroyReason: destroyReason || undefined,
                })
                setIsDeleteDialogOpen(false)
              }}
            >
              Delete Plant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
