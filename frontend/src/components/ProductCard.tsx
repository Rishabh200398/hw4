import { Link } from 'react-router-dom'
import type { Product } from '../types'

export default function ProductCard({ product, onShopNow }: { product: Product; onShopNow: (p: Product) => void }) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.product_id}`} className="product-link">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        <div className="product-body">
          <h3>{product.name}</h3>
          <p className="price">${product.price.toFixed(2)}</p>
          <p className="product-desc">{product.description}</p>
        </div>
      </Link>
      <div className="product-footer">
        <button className="btn btn-accent btn-block" onClick={() => onShopNow(product)}>
          Shop now
        </button>
      </div>
    </article>
  )
}
