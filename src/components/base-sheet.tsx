import { Button } from '~/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { Plus } from 'lucide-react'
import { ScrollArea } from '~/components/ui/scroll-area'

interface BaseSheetProps<T> {
  mode: 'create' | 'edit'
  entity?: T
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}

export function BaseSheet<T>({
  mode,
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
}: BaseSheetProps<T>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ?? (
        <SheetTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {mode === 'edit' ? 'Edit' : 'Create'}
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="w-full p-0 sm:max-w-2xl max-h-[calc(100vh)]">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle>
            {mode === 'edit' ? `Edit ${title}` : `Create ${title}`}
          </SheetTitle>
          <SheetDescription>
            {mode === 'edit'
              ? `Make changes to your ${description}.`
              : `Add a new ${description} to your grow operation.`}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] p-4">{children}</ScrollArea>
        <SheetFooter className="pb-12 px-4">
          <div className="flex justify-end gap-2">
            <Button type="submit">
              {mode === 'edit' ? 'Save Changes' : 'Create'}
            </Button>
            <Button type="button" variant="ghost" size="sm">
              Cancel
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
