'use client'

import mermaid from 'mermaid'
import { useEffect, useRef, useState } from 'react'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  er: {
    diagramPadding: 20,
    useMaxWidth: true,
  },
})

interface MermaidProps {
  chart: string
}

export function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || !chart) return

    const renderChart = async () => {
      try {
        console.log('Attempting to render chart:', chart)
        console.log('Chart string:', chart)
        console.log('Container exists:', !!containerRef.current)
        const { svg } = await mermaid.render('schema-diagram', chart)
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch (err) {
        console.error('Mermaid render error:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to render diagram'
        )
      }
    }

    void renderChart()
  }, [chart])

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-red-500">
        Error rendering diagram: {error}
      </div>
    )
  }

  return (
    <div className="mermaid-wrapper">
      <div ref={containerRef} className="mermaid" />
    </div>
  )
}
