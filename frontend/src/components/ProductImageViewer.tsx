import { useRef, useState, type WheelEvent, type MouseEvent } from 'react'

const MAX_ZOOM = 4
const STEP = 0.75

// The large product image with hover-to-zoom. A magnifier hint appears on hover; click or
// scroll to zoom, move the mouse to pan to different parts, and zoom back out.
export default function ProductImageViewer({ imageUrl, name }: { imageUrl: string; name: string }) {
  const [zoom, setZoom] = useState(1)
  const [origin, setOrigin] = useState({ x: 50, y: 50 }) // transform-origin in %
  const [hovering, setHovering] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

  const zoomed = zoom > 1

  function pointPercent(e: MouseEvent): { x: number; y: number } {
    const el = stageRef.current
    if (!el) return { x: 50, y: 50 }
    const r = el.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100))
    return { x, y }
  }

  function handleMove(e: MouseEvent) {
    if (zoomed) setOrigin(pointPercent(e)) // pan: keep the point under the cursor in view
  }

  function handleClick(e: MouseEvent) {
    if (zoomed) {
      setZoom(1)
      setOrigin({ x: 50, y: 50 })
    } else {
      setOrigin(pointPercent(e))
      setZoom(2.5)
    }
  }

  function handleWheel(e: WheelEvent) {
    if (!hovering) return
    setOrigin(pointPercent(e))
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(1, +(z - Math.sign(e.deltaY) * STEP).toFixed(2))))
  }

  const changeZoom = (delta: number) =>
    setZoom((z) => {
      const next = Math.min(MAX_ZOOM, Math.max(1, +(z + delta).toFixed(2)))
      if (next === 1) setOrigin({ x: 50, y: 50 })
      return next
    })

  return (
    <div className="zoom-viewer">
      <div
        ref={stageRef}
        className={`zoom-stage ${zoomed ? 'zoomed' : 'zoomable'}`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => {
          setHovering(false)
          setZoom(1)
          setOrigin({ x: 50, y: 50 })
        }}
        onMouseMove={handleMove}
        onClick={handleClick}
        onWheel={handleWheel}
      >
        <img
          src={imageUrl}
          alt={name}
          className="zoom-img"
          draggable={false}
          style={{ transform: `scale(${zoom})`, transformOrigin: `${origin.x}% ${origin.y}%` }}
        />
        {hovering && !zoomed && (
          <div className="zoom-hint" aria-hidden="true">
            <span className="zoom-glass">🔍</span> Click or scroll to zoom
          </div>
        )}
      </div>

      <div className="zoom-controls" role="group" aria-label="Zoom">
        <button type="button" onClick={() => changeZoom(-STEP)} disabled={zoom <= 1} aria-label="Zoom out">
          −
        </button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => changeZoom(STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in">
          +
        </button>
      </div>
    </div>
  )
}
