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
import { type BatchWithRelations } from '~/lib/validations/batch'
import { BatchForm } from './batch-form'

interface BatchSheetProps {
  mode: 'create' | 'edit'
  batch?: BatchWithRelations
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function BatchSheet({
  mode,
  batch,
  open,
  onOpenChange,
  trigger,
}: BatchSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ?? (
        <SheetTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Batch
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {mode === 'edit' ? 'Edit Batch' : 'Create Batch'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'edit'
              ? 'Make changes to your batch here.'
              : 'Add a new batch to your grow operation.'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] pr-6">
          <BatchForm
            mode={mode}
            batch={batch}
            onSuccess={() => onOpenChange?.(false)}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
