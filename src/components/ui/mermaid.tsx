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
  deterministicIds: true, // For consistent rendering
  er: {
    diagramPadding: 20,
    useMaxWidth: true,
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    padding: 20,
  },
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 10,
    actorMargin: 50,
    width: 150,
    height: 65,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    mirrorActors: true,
  },
  // Enable pan and zoom with elk layout engine
  layout: 'elk',
  maxTextSize: 5000,
  elk: {
    mergeEdges: true,
    nodePlacementStrategy: 'NETWORK_SIMPLEX',
  },
  enableZoom: true,
  zoomScale: 1,
  pan: {
    enabled: true,
    useZoom: true,
  },
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

  // Add zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3)) // Max zoom 3x
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5)) // Min zoom 0.5x
  }

  const handleZoomReset = () => {
    setZoom(1)
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
            svgElement.style.transform = `scale(${zoom})`
            svgElement.style.transformOrigin = 'center'
            svgElement.style.transition = 'transform 0.2s'
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
  }, [chart, theme, zoom])

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
      <div className={cn('overflow-hidden', className)}>
        <div
          ref={containerRef}
          className="mermaid min-h-[500px] w-full p-4"
          style={{
            touchAction: 'pan-x pan-y',
            shapeRendering: 'geometricPrecision',
            textRendering: 'optimizeLegibility',
            cursor: 'grab',
          }}
        />
      </div>
    </div>
  )
}
