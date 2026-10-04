import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PurchaseOptions from '../components/PurchaseOptions'
import ProductImageViewer from '../components/ProductImageViewer'
import SocialProof from '../components/SocialProof'
import { useSetViewedProduct } from '../pageContext'
import type { Product } from '../types'

// Keyed by product id so state resets cleanly when moving between products.
export default function ProductDetail() {
  const { productId = '' } = useParams()
  return <ProductDetailView key={productId} productId={productId} />
}

function ProductDetailView({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')
  useSetViewedProduct(product?.product_id ?? null, product?.name ?? null)

  useEffect(() => {
    fetch(`/api/products/${encodeURIComponent(productId)}`)
      .then((res) => {
        if (res.status === 404) {
          setStatus('missing')
          return null
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: Product | null) => {
        if (data) {
          setProduct(data)
          setStatus('ready')
        }
      })
      .catch(() => setStatus('error'))
  }, [productId])

  if (status === 'loading') return <section className="section muted">Loading product…</section>
  if (status === 'missing')
    return (
      <section className="section">
        <h1>Product not found</h1>
        <Link to="/products" className="text-link">← Back to all products</Link>
      </section>
    )
  if (status === 'error' || !product)
    return (
      <section className="section">
        <div className="notice">We couldn't load this product right now.</div>
      </section>
    )

  return (
    <section className="section">
      <Link to="/products" className="text-link back-link">← Back to all products</Link>
      <div className="detail">
        <div className="detail-image">
          <ProductImageViewer imageUrl={product.image_url} name={product.name} />
        </div>
        <div className="detail-info">
          <p className="eyebrow dark">{product.garment_type}</p>
          <h1>{product.name}</h1>
          <p className="price large">${product.price.toFixed(2)}</p>
          <SocialProof social={product.social} />
          <p>{product.description}</p>

          <div className="detail-meta">
            <div>
              <span className="purchase-label">Colors</span>
              <div className="chips">
                {product.colors.map((c) => (
                  <span key={c} className="chip">{c}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="purchase-label">Total in stock</span>
              <p className={product.total_stock === 0 ? 'stock-out' : 'stock-in'}>
                {product.total_stock === 0 ? 'Sold out' : `${product.total_stock} units across all sizes`}
              </p>
            </div>
          </div>

          <PurchaseOptions product={product} showStock />
        </div>
      </div>
    </section>
  )
}
