import { useEffect, useRef, useState } from 'react'
import { PRICE_RANGES, type Category } from '../productMeta'

export interface AppliedFilters {
  types: Category[]
  prices: string[]
}

interface Props {
  availableCategories: Category[]
  applied: AppliedFilters
  onApply: (filters: AppliedFilters) => void
}

// A dropdown of type checkboxes and a dropdown of price-range checkboxes.
// Selections are staged until "Apply filters" is clicked.
export default function ProductFilters({ availableCategories, applied, onApply }: Props) {
  const [open, setOpen] = useState<'type' | 'price' | null>(null)
  const [types, setTypes] = useState<Category[]>(applied.types)
  const [prices, setPrices] = useState<string[]>(applied.prices)
  const ref = useRef<HTMLDivElement>(null)

  // Keep staged selection in step if the applied filters are cleared from outside.
  useEffect(() => {
    setTypes(applied.types)
    setPrices(applied.prices)
  }, [applied])

  // Close an open dropdown when clicking outside the filter bar.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  const activeCount = applied.types.length + applied.prices.length

  return (
    <div className="filters" ref={ref}>
      <div className="filter-dropdown">
        <button
          type="button"
          className={`filter-trigger ${open === 'type' ? 'open' : ''}`}
          aria-expanded={open === 'type'}
          onClick={() => setOpen(open === 'type' ? null : 'type')}
        >
          Product type{types.length > 0 && <span className="filter-chip">{types.length}</span>} ▾
        </button>
        {open === 'type' && (
          <div className="filter-panel" role="group" aria-label="Product type">
            {availableCategories.map((c) => (
              <label key={c} className="filter-check">
                <input type="checkbox" checked={types.includes(c)} onChange={() => setTypes(toggle(types, c))} />
                {c}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-dropdown">
        <button
          type="button"
          className={`filter-trigger ${open === 'price' ? 'open' : ''}`}
          aria-expanded={open === 'price'}
          onClick={() => setOpen(open === 'price' ? null : 'price')}
        >
          Price{prices.length > 0 && <span className="filter-chip">{prices.length}</span>} ▾
        </button>
        {open === 'price' && (
          <div className="filter-panel" role="group" aria-label="Price range">
            {PRICE_RANGES.map((r) => (
              <label key={r.key} className="filter-check">
                <input type="checkbox" checked={prices.includes(r.key)} onChange={() => setPrices(toggle(prices, r.key))} />
                {r.label}
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className="btn btn-primary btn-small"
        onClick={() => {
          onApply({ types, prices })
          setOpen(null)
        }}
      >
        Apply filters
      </button>
      {activeCount > 0 && (
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setTypes([])
            setPrices([])
            onApply({ types: [], prices: [] })
            setOpen(null)
          }}
        >
          Clear ({activeCount})
        </button>
      )}
    </div>
  )
}
