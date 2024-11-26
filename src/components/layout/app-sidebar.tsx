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
  Building,
  Grid2x2,
  LandPlot,
  Factory,
  FileText,
  ListCheck,
  Thermometer,
  Wheat,
} from 'lucide-react'
import { NavMain } from '~/components/layout/nav-main'
import { NavSecondary } from '~/components/layout/nav-secondary'
import { NavUser } from '~/components/layout/nav-user'
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

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: PieChart,
      isActive: true,
    },
    {
      title: 'Buildings',
      url: '/buildings',
      icon: Building,
    },
    {
      title: 'Rooms',
      url: '/rooms',
      icon: Grid2x2,
    },
    {
      title: 'Locations',
      url: '/locations',
      icon: LandPlot,
    },
    {
      title: 'Genetics',
      url: '/genetics',
      icon: Dna,
    },
    {
      title: 'Batches',
      url: '/batches',
      icon: Package,
    },
    {
      title: 'Plants',
      url: '/plants',
      icon: Sprout,
    },
    {
      title: 'Tasks',
      url: '/tasks',
      icon: ListCheck,
    },
    {
      title: 'Notes',
      url: '/notes',
      icon: FileText,
    },
    {
      title: 'Sensors',
      url: '/sensors',
      icon: Thermometer,
    },
    {
      title: 'Processing',
      url: '/processing',
      icon: Factory,
    },
    {
      title: 'Harvests',
      url: '/harvests',
      icon: Wheat,
    },
  ],
  navSecondary: [
    {
      title: 'Github',
      url: 'https://github.com/stewnight/legacy-grow-app',
      icon: Github,
      isExternal: true,
    },
    {
      title: 'Schema',
      url: 'https://github.com/stewnight/legacy-grow-app/blob/main/SCHEMA.md',
      icon: DatabaseIcon,
      isExternal: true,
    },
  ],
}

export function AppSidebar({
  user,
  ...props
}: { user: User | null | undefined } & React.ComponentProps<typeof Sidebar>) {
  if (!user) return null

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
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
