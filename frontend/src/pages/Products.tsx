import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import ShopNowModal from '../components/ShopNowModal'
import ProductFilters, { type AppliedFilters } from '../components/ProductFilters'
import type { Product } from '../types'
import { usePageContext } from '../pageContext'
import { CATEGORY_ORDER, PRICE_RANGES, categoryOf, type Category } from '../productMeta'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [selected, setSelected] = useState<Product | null>(null)
  const [filters, setFilters] = useState<AppliedFilters>({ types: [], prices: [] })
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('type') ?? ''
  const { setVisible, reset } = usePageContext()

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: Product[]) => {
        setProducts(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  // Which categories actually exist in the catalogue, in a sensible order.
  const availableCategories = useMemo<Category[]>(() => {
    const present = new Set(products.map(categoryOf))
    return CATEGORY_ORDER.filter((c) => present.has(c))
  }, [products])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const activePriceTests = PRICE_RANGES.filter((r) => filters.prices.includes(r.key))
    return products.filter((p) => {
      const matchesSearch =
        !q || [p.name, p.garment_type, ...p.search_tags].some((f) => f.toLowerCase().includes(q))
      const matchesType = filters.types.length === 0 || filters.types.includes(categoryOf(p))
      const matchesPrice = activePriceTests.length === 0 || activePriceTests.some((r) => r.test(p.price))
      return matchesSearch && matchesType && matchesPrice
    })
  }, [products, query, filters])

  useEffect(() => {
    setVisible(visible.map((p) => p.product_id))
    return () => reset()
  }, [visible, setVisible, reset])

  return (
    <>
      <section className="page-hero">
        <h1>Products</h1>
        <p>Hoodies, crewnecks, tees and more — all officially licensed Yale gear.</p>
      </section>

      <section className="section">
        <div className="filter-bar">
          <input
            type="search"
            placeholder="Search by name or type, e.g. hoodie"
            value={query}
            onChange={(e) => setSearchParams(e.target.value ? { type: e.target.value } : {})}
          />
          {status === 'ready' && <span className="muted">{visible.length} items</span>}
        </div>

        {status === 'ready' && (
          <ProductFilters availableCategories={availableCategories} applied={filters} onApply={setFilters} />
        )}

        {status === 'loading' && <p className="muted">Loading products…</p>}
        {status === 'error' && (
          <div className="notice">
            We couldn't load the catalogue right now. (Developer note: start the FastAPI backend on port 8000.)
          </div>
        )}
        {status === 'ready' && visible.length === 0 && (
          <p className="muted">No products match your search and filters.</p>
        )}

        <div className="product-grid">
          {visible.map((p) => (
            <ProductCard key={p.product_id} product={p} onShopNow={setSelected} />
          ))}
        </div>
      </section>

      {selected && <ShopNowModal product={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
