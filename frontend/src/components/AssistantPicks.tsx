import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useChatResults } from '../chatResults'
import ProductCard from './ProductCard'
import ShopNowModal from './ShopNowModal'
import type { Product } from '../types'

// Page-level band that renders the product matches the chatbot returned, as full
// product cards. Appears on whatever page the shopper is on, and clears on demand.
export default function AssistantPicks() {
  const { matches, query, originPath, clear } = useChatResults()
  const { pathname } = useLocation()
  const [selected, setSelected] = useState<Product | null>(null)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (matches.length > 0) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [matches])

  const onProductDetail = pathname.startsWith('/products/')
  // Only show on the page where the shopper asked, so matches don't follow them around.
  if (matches.length === 0 || pathname !== originPath || onProductDetail) return null

  return (
    <section className="assistant-picks" aria-label="Items the assistant found" ref={ref}>
      <div className="assistant-picks-head">
        <div>
          <p className="eyebrow dark">From your chat</p>
          <h2>{query ? `Matches for “${query}”` : 'Picked out for you'}</h2>
        </div>
        <button className="btn btn-outline-navy btn-small" onClick={clear}>
          Clear
        </button>
      </div>
      <div className="product-grid">
        {matches.map((p) => (
          <ProductCard key={p.product_id} product={p} onShopNow={setSelected} />
        ))}
      </div>
      {selected && <ShopNowModal product={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
