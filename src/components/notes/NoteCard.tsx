import { type Note } from '~/server/db/schemas/notes'
import { Card, CardContent, CardFooter } from '~/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '~/components/ui/button'
import {
  MessageCircle,
  MoreVertical,
  ImageIcon,
  Mic,
  Paperclip,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '~/components/ui/hover-card'
import { Badge } from '~/components/ui/badge'
import Image from 'next/image'

interface NoteWithUser extends Note {
  createdBy: {
    name: string | null
    image: string | null
  }
}

interface NoteCardProps {
  note: NoteWithUser
  onReply?: (noteId: number) => void
  onEdit?: (note: NoteWithUser) => void
  onDelete?: (noteId: number) => void
}

const NoteTypeIcon = ({ type }: { type: Note['type'] }) => {
  switch (type) {
    case 'image':
      return <ImageIcon className="h-4 w-4" />
    case 'voice':
      return <Mic className="h-4 w-4" />
    case 'file':
      return <Paperclip className="h-4 w-4" />
    default:
      return null
  }
}

export function NoteCard({ note, onReply, onEdit, onDelete }: NoteCardProps) {
  const createdAt = new Date(note.createdAt)

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex gap-4">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarImage src={note.createdBy.image ?? undefined} />
                <AvatarFallback>
                  {note.createdBy.name?.charAt(0) ?? '?'}
                </AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <Avatar>
                  <AvatarImage src={note.createdBy.image ?? undefined} />
                  <AvatarFallback>
                    {note.createdBy.name?.charAt(0) ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    {note.createdBy.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Created{' '}
                    {formatDistanceToNow(createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{note.createdBy.name}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(createdAt, { addSuffix: true })}
                </span>
                {note.type !== 'text' && (
                  <Badge variant="secondary">
                    <NoteTypeIcon type={note.type} />
                    <span className="ml-1 capitalize">{note.type}</span>
                  </Badge>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(note)}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(note.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-2 whitespace-pre-wrap">{note.content}</div>

            {/* Render media content based on type */}
            {note.type === 'image' && note.metadata?.mimeType && (
              <div className="mt-2 rounded-md overflow-hidden">
                <Image
                  src={note.content}
                  alt="Note attachment"
                  width={800}
                  height={600}
                  className="max-h-96 object-contain"
                />
              </div>
            )}

            {note.type === 'voice' && (
              <div className="mt-2">
                <audio controls src={note.content} className="w-full" />
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {onReply && (
        <CardFooter>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => onReply(note.id)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Reply
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
