'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, X, Wrench, Package, HardHat } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface RequirementsManagerProps {
  value: {
    tools: string[]
    supplies: string[]
    ppe: string[]
  }
  onChange: (value: {
    tools: string[]
    supplies: string[]
    ppe: string[]
  }) => void
}

type RequirementType = 'tools' | 'supplies' | 'ppe'

export function RequirementsManager({
  value,
  onChange,
}: RequirementsManagerProps) {
  const [newItem, setNewItem] = useState('')
  const [activeTab, setActiveTab] = useState<RequirementType>('tools')

  const addItem = () => {
    if (newItem.trim()) {
      onChange({
        ...value,
        [activeTab]: [...value[activeTab], newItem.trim()],
      })
      setNewItem('')
    }
  }

  const removeItem = (type: RequirementType, index: number) => {
    const updatedItems = value[type].filter((_, i) => i !== index)
    onChange({
      ...value,
      [type]: updatedItems,
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem()
    }
  }

  const renderList = (type: RequirementType, icon: JSX.Element) => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder={`Add ${type}...`}
          value={type === activeTab ? newItem : ''}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addItem}
          disabled={!newItem.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[200px] rounded-md border p-2">
        {value[type].length > 0 ? (
          <div className="space-y-2">
            {value[type].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border bg-card p-3 text-card-foreground"
              >
                {icon}
                <span className="flex-1 text-sm">{item}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(type, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No {type} added
          </div>
        )}
      </ScrollArea>
    </div>
  )

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as RequirementType)}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tools" className="flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Tools
        </TabsTrigger>
        <TabsTrigger value="supplies" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Supplies
        </TabsTrigger>
        <TabsTrigger value="ppe" className="flex items-center gap-2">
          <HardHat className="h-4 w-4" />
          PPE
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tools">
        {renderList(
          'tools',
          <Wrench className="h-4 w-4 text-muted-foreground" />
        )}
      </TabsContent>
      <TabsContent value="supplies">
        {renderList(
          'supplies',
          <Package className="h-4 w-4 text-muted-foreground" />
        )}
      </TabsContent>
      <TabsContent value="ppe">
        {renderList(
          'ppe',
          <HardHat className="h-4 w-4 text-muted-foreground" />
        )}
      </TabsContent>
    </Tabs>
  )
}
