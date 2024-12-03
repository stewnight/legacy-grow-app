'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { type JobStatus, type JobPriority } from '~/server/db/schema/enums'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { api } from '~/trpc/react'
import { Plus, X } from 'lucide-react'
import { Badge } from '~/components/ui/badge'

interface JobsFiltersProps {
  userId: string
}

export function JobsFilters({ userId }: JobsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: users } = api.user.getAll.useQuery()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/jobs?${params.toString()}`)
  }

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    router.push(`/jobs?${params.toString()}`)
  }

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
  ]

  const priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ]

  const currentUser = users?.find((u) => u.id === userId)
  const selectedStatus = searchParams.get('status')
  const selectedPriority = searchParams.get('priority')
  const selectedAssignee = searchParams.get('assignedToId')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filters:</span>
        <div className="flex gap-2">
          {!selectedStatus ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant="outline"
                  className="bg-background/60 opacity-60 hover:opacity-80 cursor-pointer text-xs font-light"
                >
                  Status
                  <Plus className="h-4 w-4 ml-1" />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {statusOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => updateFilter('status', option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Badge
              variant="secondary"
              className="bg-secondary/30 hover:bg-secondary/50 cursor-pointer"
              onClick={() => removeFilter('status')}
            >
              {statusOptions.find((o) => o.value === selectedStatus)?.label}
              <X className="h-4 w-4 ml-1" />
            </Badge>
          )}

          {!selectedPriority ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant="outline"
                  className="bg-background/60 opacity-60 hover:opacity-80 cursor-pointer text-xs font-light"
                >
                  Priority
                  <Plus className="h-4 w-4 ml-1" />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {priorityOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => updateFilter('priority', option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Badge
              variant="secondary"
              className="bg-secondary/30 hover:bg-secondary/50 cursor-pointer"
              onClick={() => removeFilter('priority')}
            >
              {priorityOptions.find((o) => o.value === selectedPriority)?.label}
              <X className="h-4 w-4 ml-2" />
            </Badge>
          )}

          {!selectedAssignee ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant="outline"
                  className="bg-background/60 opacity-60 hover:opacity-80 cursor-pointer text-xs font-light"
                >
                  Assignee
                  <Plus className="h-4 w-4 ml-1" />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem
                  onClick={() => updateFilter('assignedToId', userId)}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={currentUser?.image || ''} />
                    <AvatarFallback>
                      {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span>Me</span>
                </DropdownMenuItem>
                {users
                  ?.filter((u) => u.id !== userId)
                  .map((user) => (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => updateFilter('assignedToId', user.id)}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.image || ''} />
                        <AvatarFallback>
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Badge
              variant="secondary"
              className="bg-secondary/30 hover:bg-secondary/50 cursor-pointer"
              onClick={() => removeFilter('assignedToId')}
            >
              <Avatar className="h-4 w-4 mr-2">
                <AvatarImage
                  src={
                    users?.find((u) => u.id === selectedAssignee)?.image || ''
                  }
                />
                <AvatarFallback>
                  {users
                    ?.find((u) => u.id === selectedAssignee)
                    ?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {selectedAssignee === userId
                ? 'Me'
                : users?.find((u) => u.id === selectedAssignee)?.name ||
                  'All Jobs'}
              <X className="h-4 w-4 ml-2" />
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
