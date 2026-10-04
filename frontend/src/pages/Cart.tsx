import { Link } from 'react-router-dom'
import { useCart } from '../cart'

export default function Cart() {
  const { items, total, removeItem } = useCart()

  return (
    <section className="section cart-page">
      <h1>Your cart</h1>
      {items.length === 0 ? (
        <p className="muted">
          Your cart is empty. <Link to="/products" className="text-link">Browse products</Link>
        </p>
      ) : (
        <>
          <ul className="cart-list">
            {items.map((i) => (
              <li key={`${i.product_id}-${i.size}`} className="cart-row">
                <img src={i.image_url} alt={i.name} />
                <div>
                  <Link to={`/products/${i.product_id}`} className="cart-name">{i.name}</Link>
                  <p className="muted">Size {i.size} · Qty {i.quantity}</p>
                </div>
                <strong>${(i.price * i.quantity).toFixed(2)}</strong>
                <button className="link-button" onClick={() => removeItem(i.product_id, i.size)}>Remove</button>
              </li>
            ))}
          </ul>
          <p className="cart-total">Total: <strong>${total.toFixed(2)}</strong></p>
          <p className="muted">Checkout isn't connected yet.</p>
        </>
      )}
    </section>
  )
}
