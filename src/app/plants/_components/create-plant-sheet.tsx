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
import { CreatePlantForm } from './create-plant-form'

export function CreatePlantSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Plant
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-[540px] p-0">
        <ScrollArea className="h-full w-full">
          <div className="p-6">
            <SheetHeader>
              <SheetTitle>Create New Plant</SheetTitle>
              <SheetDescription>
                Add a new plant to track its growth and health.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <CreatePlantForm />
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
