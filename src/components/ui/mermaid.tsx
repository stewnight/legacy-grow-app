'use client'

import mermaid from 'mermaid'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '~/lib/utils'
import { MinusIcon, PlusIcon } from 'lucide-react'

// Initialize with recommended settings
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'ui-monospace, monospace',
  fontSize: 14,
  htmlLabels: true,
  deterministicIds: true,
})

interface MermaidProps {
  chart: string
  className?: string
}

export function Mermaid({ chart, className }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 10)) // Max zoom 10x
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5)) // Min zoom 0.5x
  }

  const handleZoomReset = () => {
    setZoom(1)
  }

  // Add these handlers to the component
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    setIsDragging(true)
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const touch = e.touches[0]
    if (!touch) return
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (!containerRef.current || !chart) return

    const renderChart = async () => {
      try {
        // Update theme configuration based on system theme
        mermaid.initialize({
          theme: theme === 'dark' ? 'dark' : 'default',
          darkMode: theme === 'dark',
          themeVariables: {
            fontSize: '14px',
            fontFamily: 'ui-monospace, monospace',
            lineWidth: '2px',
            radius: '2.5rem',
            // Theme-specific colors
            primaryColor: theme === 'dark' ? '#93c5fd' : '#3b82f6',
            primaryBorderColor: theme === 'dark' ? '#60a5fa' : '#2563eb',
            primaryTextColor: theme === 'dark' ? '#f8fafc' : '#0f172a',
            // Background colors
            mainBkg: theme === 'dark' ? '#1a1b1e' : '#ffffff',
            nodeBkg: theme === 'dark' ? '#1a1b1e' : '#ffffff',
            // Border colors
            nodeBorder: theme === 'dark' ? '#4a4b4e' : '#e2e8f0',
            // Line colors
            lineColor: theme === 'dark' ? '#4a4b4e' : '#64748b',
          },
        })

        const { svg } = await mermaid.render('schema-diagram', chart)
        if (containerRef.current) {
          containerRef.current.innerHTML = svg

          // Add zoom transform to the SVG
          const svgElement = containerRef.current.querySelector('svg')
          if (svgElement) {
            svgElement.style.transform = `scale(${zoom}) translate(${position.x}px, ${position.y}px)`
            svgElement.style.transformOrigin = 'center'
            svgElement.style.transition = isDragging ? 'none' : 'transform 0.2s'
            svgElement.style.cursor = isDragging ? 'grabbing' : 'grab'
          }
        }
      } catch (err) {
        console.error('Mermaid render error:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to render diagram'
        )
      }
    }

    void renderChart()
  }, [chart, theme, zoom, position, isDragging])

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        Error rendering diagram: {error}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleZoomOut}
          className="rounded-md border p-1 hover:bg-accent"
          title="Zoom Out"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomReset}
          className="rounded-md border px-2 py-1 text-sm hover:bg-accent"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          className="rounded-md border p-1 hover:bg-accent"
          title="Zoom In"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
      <div className={cn('relative overflow-hidden rounded-lg', className)}>
        <div
          ref={containerRef}
          className="mermaid w-full min-h-96 p-4"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            touchAction: 'none',
            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: '0 0',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        />
      </div>
    </div>
  )
}
