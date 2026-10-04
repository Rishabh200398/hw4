import { useEffect, useState } from 'react'
import { useCart } from '../cart'
import { celebrate } from '../utils/celebrate'
import type { Product } from '../types'

// Size picker, quantity stepper, Add to cart and Pay now. Used by the Shop Now dialog and the product page.
export default function PurchaseOptions({ product, showStock = false }: { product: Product; showStock?: boolean }) {
  const { addItem, quantityOf } = useCart()
  const firstInStock = product.inventory.find((s) => s.quantity > 0)?.size ?? ''
  const [size, setSize] = useState(firstInStock)
  // The stepper is the desired quantity in the cart for this size. Start from whatever is
  // already in the cart (so re-opening reflects it), or 1.
  const [quantity, setQuantity] = useState(() => quantityOf(product.product_id, firstInStock) || 1)
  const [message, setMessage] = useState<{ kind: 'success' | 'info'; text: string } | null>(null)

  const available = product.inventory.find((s) => s.size === size)?.quantity ?? 0
  const inCart = quantityOf(product.product_id, size)
  const soldOut = product.total_stock === 0
  // Can't re-add the same amount that's already in the cart; must change the quantity.
  const alreadyInCart = inCart > 0 && inCart === quantity

  // Keep the stepper in sync with the cart when the size changes.
  useEffect(() => {
    setQuantity(quantityOf(product.product_id, size) || 1)
    setMessage(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size])

  function chooseSize(next: string) {
    setSize(next)
  }

  function addToCart() {
    const result = addItem({
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size,
      quantity,
    })
    if (result === 'already') {
      setMessage({ kind: 'info', text: `${product.name} (${size}) is already in your cart. Change the quantity to add more.` })
      return
    }
    setMessage({ kind: 'success', text: `${product.name} (${size}) — ${quantity} in your cart.` })
    celebrate('Product added to cart!')
  }

  function payNow() {
    // Checkout isn't connected to a payment provider yet.
    setMessage({ kind: 'info', text: `Checkout is coming soon. Your total would be $${(product.price * quantity).toFixed(2)} for ${quantity} × ${size}.` })
  }

  return (
    <div className="purchase">
      <div className="purchase-label">
        Size {size && <span className="muted">— {available} in stock</span>}
      </div>
      <div className="size-picker" role="radiogroup" aria-label="Size">
        {product.inventory.map((s) => (
          <button
            key={s.size}
            type="button"
            role="radio"
            aria-checked={size === s.size}
            disabled={s.quantity === 0}
            className={`size-option ${size === s.size ? 'selected' : ''}`}
            onClick={() => chooseSize(s.size)}
            title={s.quantity === 0 ? 'Out of stock' : `${s.quantity} in stock`}
          >
            {s.size}
            {showStock && <small>{s.quantity === 0 ? 'Sold out' : `${s.quantity} left`}</small>}
          </button>
        ))}
      </div>

      <div className="purchase-label">Quantity{inCart > 0 && <span className="muted"> — {inCart} in cart</span>}</div>
      <div className="qty">
        <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>
          −
        </button>
        <span aria-live="polite">{quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => Math.min(available, q + 1))}
          disabled={quantity >= available}
        >
          +
        </button>
      </div>

      {soldOut ? (
        <div className="notice error">Sorry, this item is sold out in every size.</div>
      ) : (
        <div className="purchase-actions">
          <button type="button" className="btn btn-primary" onClick={addToCart} disabled={!size || alreadyInCart}>
            {alreadyInCart ? 'In cart' : 'Add to cart'}
          </button>
          <button type="button" className="btn btn-accent" onClick={payNow} disabled={!size}>
            Pay now
          </button>
        </div>
      )}
      {message && <div className={`notice ${message.kind === 'success' ? 'success' : ''}`}>{message.text}</div>}
    </div>
  )
}
