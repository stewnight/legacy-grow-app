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
import { type PlantWithRelations } from '~/lib/validations/plant'
import { PlantForm } from './plant-form'

interface PlantSheetProps {
  mode: 'create' | 'edit'
  plant?: PlantWithRelations
  batchId?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function PlantSheet({
  mode,
  plant,
  batchId,
  open,
  onOpenChange,
  trigger,
}: PlantSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ?? (
        <SheetTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Plant
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {mode === 'edit' ? 'Edit Plant' : 'Create Plant'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'edit'
              ? 'Make changes to your plant here.'
              : 'Add a new plant to your grow operation.'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] pr-6">
          <PlantForm
            mode={mode}
            plant={plant}
            batchId={batchId}
            onSuccess={() => onOpenChange?.(false)}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
