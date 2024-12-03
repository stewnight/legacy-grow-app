'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, X, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '~/lib/utils'

interface InstructionsManagerProps {
  value: string[]
  onChange: (value: string[]) => void
}

interface SortableItemProps {
  id: string
  index: number
  instruction: string
  onRemove: () => void
}

function SortableItem({ id, instruction, index, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-lg border bg-card p-3 text-card-foreground',
        isDragging && 'opacity-50'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm">
        {index + 1}. {instruction}
      </span>
      <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function InstructionsManager({
  value,
  onChange,
}: InstructionsManagerProps) {
  const [newInstruction, setNewInstruction] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addInstruction = () => {
    if (newInstruction.trim()) {
      onChange([...value, newInstruction.trim()])
      setNewInstruction('')
    }
  }

  const removeInstruction = (index: number) => {
    const updatedInstructions = value.filter((_, i) => i !== index)
    onChange(updatedInstructions)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addInstruction()
    }
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = value.findIndex((item) => `item-${item}` === active.id)
      const newIndex = value.findIndex((item) => `item-${item}` === over.id)

      onChange(arrayMove(value, oldIndex, newIndex))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add a new instruction..."
          value={newInstruction}
          onChange={(e) => setNewInstruction(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addInstruction}
          disabled={!newInstruction.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[200px] rounded-md border p-2">
        {value && value.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={value.map((item) => `item-${item}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {value.map((instruction, index) => (
                  <SortableItem
                    key={`item-${instruction}`}
                    id={`item-${instruction}`}
                    index={index}
                    instruction={instruction}
                    onRemove={() => removeInstruction(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No instructions added
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
