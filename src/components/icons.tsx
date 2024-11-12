'use client'

import {
  Leaf,
  Sprout,
  Flower2,
  Package,
  AlertTriangle,
  Heart,
  Bug,
  Droplets,
  Skull,
  CircleMinus,
  CircleDot,
  HelpCircle,
  Combine,
  GitBranch,
  Flower as FlowerIcon,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import type {
  HealthStatus,
  PlantSex,
  PlantStage,
  PlantSource,
} from '../server/db/schema/enums'

interface StatusIconProps {
  className?: string
}

export function HealthStatusIcon({
  status,
  className,
}: { status: HealthStatus } & StatusIconProps) {
  const icon = {
    healthy: <Heart className={className} />,
    sick: <AlertTriangle className={className} />,
    pest: <Bug className={className} />,
    nutrient: <Droplets className={className} />,
    dead: <Skull className={className} />,
  } as const

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{icon[status]}</TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">{status} Status</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function PlantSexIcon({
  sex,
  className,
}: { sex: PlantSex } & StatusIconProps) {
  const icon = {
    male: <CircleMinus className={className} />,
    female: <CircleDot className={className} />,
    hermaphrodite: <Combine className={className} />,
    unknown: <HelpCircle className={className} />,
  } as const

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{icon[sex]}</TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">{sex}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function PlantStageIcon({
  stage,
  className,
}: { stage: PlantStage } & StatusIconProps) {
  const icon = {
    seedling: <Sprout className={className} />,
    vegetative: <Leaf className={className} />,
    flowering: <FlowerIcon className={className} />,
    harvested: <Package className={className} />,
  } as const

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{icon[stage]}</TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">{stage} Stage</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function PlantSourceIcon({
  source,
  className,
}: { source: PlantSource } & StatusIconProps) {
  const icon = {
    seed: <Sprout className={className} />,
    clone: <GitBranch className={className} />,
    mother: <Flower2 className={className} />,
  } as const

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{icon[source]}</TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">{source} Source</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function QuarantineIcon({
  quarantine,
  className,
}: { quarantine: boolean } & StatusIconProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <AlertTriangle className={className} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{quarantine ? 'In Quarantine' : 'Not Quarantined'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
