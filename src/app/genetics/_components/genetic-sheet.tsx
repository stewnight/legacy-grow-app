'use client'

import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-react'
import { ScrollArea } from '~/components/ui/scroll-area'
import { type Genetic, type Plant, type Batch } from '~/server/db/schemas'
import { GeneticForm } from './genetic-form'
import { GeneticWithRelations } from '../../../lib/validations/genetic'

interface GeneticSheetProps {
  mode: 'create' | 'edit'
  genetic?: GeneticWithRelations
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function GeneticSheet({
  mode,
  genetic,
  open,
  onOpenChange,
  trigger,
}: GeneticSheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined && onOpenChange !== undefined

  const handleOpenChange = (value: boolean) => {
    if (isControlled) {
      onOpenChange(value)
    } else {
      setInternalOpen(value)
    }
  }

  const sheetOpen = isControlled ? open : internalOpen

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <SheetTrigger asChild>{trigger}</SheetTrigger>
      ) : mode === 'create' ? (
        <SheetTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Genetic
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent className="w-full p-0 sm:max-w-2xl">
        <ScrollArea className="h-full w-full">
          <div className="flex flex-col space-y-4 p-6 pb-8">
            <SheetHeader>
              <SheetTitle>
                {mode === 'create' ? 'Create New Genetic' : 'Edit Genetic'}
              </SheetTitle>
              <SheetDescription>
                {mode === 'create'
                  ? 'Add a new genetic to your library'
                  : 'Update the details for this genetic strain'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1">
              <GeneticForm
                mode={mode}
                genetic={
                  genetic
                    ? {
                        ...genetic,
                        plants: genetic.plants || [],
                        batches: genetic.batches || [],
                        _count: genetic._count || { plants: 0, batches: 0 },
                      }
                    : undefined
                }
                onSuccess={() => handleOpenChange(false)}
              />
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
