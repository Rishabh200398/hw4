import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PurchaseOptions from './PurchaseOptions'
import ProductImageViewer from './ProductImageViewer'
import SocialProof from './SocialProof'
import type { Product } from '../types'

export default function ShopNowModal({ product, onClose }: { product: Product; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-now-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <div className="modal-image">
          <ProductImageViewer imageUrl={product.image_url} name={product.name} />
        </div>
        <div className="modal-body">
          <h2 id="shop-now-title">{product.name}</h2>
          <p className="price large">${product.price.toFixed(2)}</p>
          <SocialProof social={product.social} />
          <PurchaseOptions product={product} />
          <Link to={`/products/${product.product_id}`} className="text-link" onClick={onClose}>
            See full details →
          </Link>
        </div>
      </div>
    </div>
  )
}
