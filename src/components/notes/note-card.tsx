'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { type RouterOutputs } from '~/trpc/shared';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '~/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { MoreVertical, Reply, Pencil, Trash2 } from 'lucide-react';
import { cn } from '~/lib/utils';
import { MediaPreview } from './media-preview';

type NoteWithUser = RouterOutputs['notes']['list']['items'][number];

interface NoteCardProps {
  note: NoteWithUser;
  onReply?: (noteId: number) => void;
  onEdit?: (note: NoteWithUser) => void;
  onDelete?: (noteId: number) => void;
  className?: string;
}

export function NoteCard({ note, onReply, onEdit, onDelete, className }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={note.createdBy.image ?? undefined} />
          <AvatarFallback>{note.createdBy.name?.charAt(0) ?? 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{note.createdBy.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {format(new Date(note.createdAt), 'PPp')}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onReply && (
                    <DropdownMenuItem onClick={() => onReply(note.id)}>
                      <Reply className="mr-2 h-4 w-4" />
                      Reply
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={() => {
                        setIsEditing(true);
                        onEdit(note);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(note.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{note.content}</p>
        {note.type !== 'text' && <MediaPreview note={note} className="mt-2" />}
      </CardContent>
      {note.parentId && (
        <CardFooter>
          <div className="text-xs text-muted-foreground">Reply to note #{note.parentId}</div>
        </CardFooter>
      )}
    </Card>
  );
}
