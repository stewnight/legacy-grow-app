'use client'

import * as React from 'react'
import { api } from '~/trpc/react'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import Link from 'next/link'
import {
  CalendarDays,
  CheckSquare,
  FileText,
  Image,
  Link as LinkIcon,
  PencilIcon,
  Tag,
  Trash2,
  ArrowLeft,
  Mic,
  File,
  Ruler,
  Clock,
  User,
} from 'lucide-react'
import { AppSheet } from '~/components/layout/app-sheet'
import { NoteForm } from '~/components/notes/notes-form'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { ScrollArea } from '~/components/ui/scroll-area'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function NotePage({ params }: PageProps) {
  const resolvedParams = React.use(params)

  const { data: note, isLoading } = api.note.get.useQuery(resolvedParams.id, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const utils = api.useUtils()
  const { mutate: deleteNote } = api.note.delete.useMutation({
    onSuccess: () => {
      window.location.href = '/notes'
    },
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-5 w-5" />
      case 'checklist':
        return <CheckSquare className="h-5 w-5" />
      case 'media':
        return <Image className="h-5 w-5" />
      case 'measurement':
        return <Ruler className="h-5 w-5" />
      case 'voice':
        return <Mic className="h-5 w-5" />
      case 'image':
        return <Image className="h-5 w-5" />
      case 'file':
        return <File className="h-5 w-5" />
      case 'link':
        return <LinkIcon className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    )
  }

  if (!note) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/notes">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">{note.title}</h2>
          </div>
          <p className="text-muted-foreground">
            Created by {note.createdBy.name} on {format(note.createdAt, 'PPp')}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <AppSheet
            mode="edit"
            entity="note"
            trigger={
              <Button variant="outline" size="icon">
                <PencilIcon className="h-4 w-4" />
              </Button>
            }
          >
            <NoteForm mode="edit" initialData={note} />
          </AppSheet>
          <Button
            variant="outline"
            size="icon"
            onClick={() => deleteNote(note.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
            {getTypeIcon(note.type)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{note.type}</div>
            <p className="text-xs text-muted-foreground">Note type</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(note.createdAt, 'PP')}
            </div>
            <p className="text-xs text-muted-foreground">Creation date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Author</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={note.createdBy.image ?? ''}
                  alt={note.createdBy.name}
                />
                <AvatarFallback>
                  {note.createdBy.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {note.createdBy.name}
                </p>
                <p className="text-xs text-muted-foreground">Author</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {note.properties?.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              )) ?? <span className="text-muted-foreground">No tags</span>}
            </div>
          </CardContent>
        </Card>

        {note.entityType !== 'none' && note.entityId && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Linked Entity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Type:{' '}
                  {note.entityType.charAt(0).toUpperCase() +
                    note.entityType.slice(1)}
                </p>
                <Link
                  href={`/${note.entityType}s/${note.entityId}`}
                  className="text-sm text-blue-500 hover:underline"
                >
                  View {note.entityType}
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="content" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Note Content</CardTitle>
              <CardDescription>Full note content and details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                {note.content}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Media Attachments</CardTitle>
              <CardDescription>
                Images and files attached to this note
              </CardDescription>
            </CardHeader>
            <CardContent>
              {note.properties?.media && note.properties.media.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {note.properties.media.map((media, index) => (
                    <div
                      key={index}
                      className="relative aspect-video overflow-hidden rounded-lg border bg-muted"
                    >
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={media.metadata?.alt as string}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <File className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <File className="h-8 w-8 mb-2" />
                  <p>No media attachments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Note History</CardTitle>
              <CardDescription>
                Changes and updates to this note
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(note.createdAt, 'PPpp')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {format(note.updatedAt, 'PPpp')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
