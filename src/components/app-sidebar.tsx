'use client'

import * as React from 'react'
import {
  Github,
  Command,
  Sprout,
  Package,
  Dna,
  PieChart,
  DatabaseIcon,
} from 'lucide-react'
import { NavMain } from '~/components/nav-main'
import { NavSecondary } from '~/components/nav-secondary'
import { NavUser } from '~/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import type { User } from 'next-auth'
import { Schema } from 'zod'

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: PieChart,
      isActive: true,
    },
    {
      title: 'Plants',
      url: '/plants',
      icon: Sprout,
    },
    {
      title: 'Batches',
      url: '/batches',
      icon: Package,
    },
    {
      title: 'Genetics',
      url: '/genetics',
      icon: Dna,
    },
  ],
  navSecondary: [
    {
      title: 'Github',
      url: 'https://github.com/stewnight/legacy-grow-app',
      icon: Github,
    },
    {
      title: 'Schema',
      url: '/schema',
      icon: DatabaseIcon,
    },
  ],
}

export function AppSidebar({
  user,
  ...props
}: { user: User | null | undefined } & React.ComponentProps<typeof Sidebar>) {
  if (!user) return null

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Legacy Grow</span>
                  <span className="truncate text-xs">Cannabis Management</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
