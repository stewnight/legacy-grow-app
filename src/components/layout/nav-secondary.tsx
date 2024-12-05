'use client';

import { ExternalLink, type LucideIcon } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar';
import { cn } from '~/lib/utils';

export function NavSecondary({
  items,
  className,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isExternal?: boolean;
  }[];
  className?: string;
}) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel>Support</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title}>
              <a href={item.url} className="flex items-center gap-2">
                <item.icon className="size-4 shrink-0" />
                <span
                  className={cn(
                    'flex items-center gap-1 transition-[width,opacity] duration-200',
                    isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  )}
                >
                  {item.title}
                  {item.isExternal && (
                    <ExternalLink className="inline size-3 text-muted-foreground" />
                  )}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
