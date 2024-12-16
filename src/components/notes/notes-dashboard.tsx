'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { type NoteWithRelations } from '~/server/db/schema'
import {
  FileText,
  CheckSquare,
  Image,
  Tag,
  CalendarDays,
  Users,
} from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'

interface NotesDashboardProps {
  notes: NoteWithRelations[]
}

export function NotesDashboard({ notes }: NotesDashboardProps) {
  // Calculate type statistics
  const typeStats = notes.reduce(
    (acc, note) => {
      acc[note.type] = (acc[note.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Get all tags and count their frequency
  const tagStats = notes.reduce(
    (acc, note) => {
      note.properties?.tags?.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>
  )

  // Get top 5 tags
  const topTags = Object.entries(tagStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Get unique contributors
  const contributors = new Set(notes.map((note) => note.createdBy.id))

  // Get recent notes (last 5)
  const recentNotes = [...notes]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Note Types</CardTitle>
          <CardDescription>Distribution of note types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(typeStats).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {type === 'text' ? (
                  <FileText className="h-4 w-4" />
                ) : type === 'checklist' ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Image className="h-4 w-4" />
                )}
                <span className="capitalize">{type}</span>
              </div>
              <Badge variant="secondary">{count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Tags</CardTitle>
          <CardDescription>Most used tags</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {topTags.map(([tag, count]) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <Tag className="h-3 w-3" />
              {tag}
              <span className="ml-1 text-xs">({count})</span>
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Quick statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Total Notes</span>
            </div>
            <Badge variant="secondary">{notes.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Contributors</span>
            </div>
            <Badge variant="secondary">{contributors.size}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Unique Tags</span>
            </div>
            <Badge variant="secondary">{Object.keys(tagStats).length}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest notes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentNotes.map((note) => (
            <div key={note.id} className="flex items-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={note.createdBy.image} />
                <AvatarFallback>
                  {note.createdBy.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{note.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
