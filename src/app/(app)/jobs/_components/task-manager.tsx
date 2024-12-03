'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TaskManagerProps {
  tasks: Array<{
    item: string
    completed: boolean
    completedAt?: string | null
  }>
  onChange: (
    tasks: Array<{
      item: string
      completed: boolean
      completedAt?: string | null
    }>
  ) => void
}

export function TaskManager({ tasks, onChange }: TaskManagerProps) {
  const [newTask, setNewTask] = useState('')

  const addTask = () => {
    if (newTask.trim()) {
      onChange([
        ...tasks,
        {
          item: newTask.trim(),
          completed: false,
          completedAt: null,
        },
      ])
      setNewTask('')
    }
  }

  const removeTask = (index: number) => {
    const updatedTasks = tasks.filter((_, i) => i !== index)
    onChange(updatedTasks)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTask()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addTask}
          disabled={!newTask.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[200px] rounded-md border p-2">
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 rounded-lg border bg-card p-2 text-card-foreground"
              >
                <span className="flex-1 text-sm">{task.item}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTask(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No tasks added
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
