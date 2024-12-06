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
import { ScrollArea } from '~/components/ui/scroll-area'

interface AppSheetProps<T> {
  mode: 'create' | 'edit'
  entity?: T
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  children: React.ReactNode
}

export function AppSheet<T>({
  mode,
  open,
  entity,
  onOpenChange,
  trigger,
  children,
}: AppSheetProps<T>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger ?? <Button>{mode === 'edit' ? 'Edit' : 'Create'}</Button>}
      </SheetTrigger>
      <SheetContent className="max-h-[calc(100vh)] w-full p-0 sm:max-w-2xl">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle>{mode === 'edit' ? `Edit ${entity}` : `Create ${entity}`}</SheetTitle>
          <SheetDescription>
            {mode === 'edit'
              ? `Make changes to your ${entity}.`
              : `Add a new ${entity} to your grow operation.`}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] p-4">{children}</ScrollArea>
        <SheetFooter className="px-4 pb-12"></SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
