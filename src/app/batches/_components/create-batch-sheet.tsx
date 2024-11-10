'use client'

import { Button } from '~/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Plus } from 'lucide-react'
import { CreateBatchForm } from './create-batch-form'

export function CreateBatchSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Batch
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full p-0">
        <ScrollArea className="h-full w-full">
          <div className="p-6">
            <SheetHeader>
              <SheetTitle>Create New Batch</SheetTitle>
              <SheetDescription>
                Create a new batch of plants with shared characteristics.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <CreateBatchForm />
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
