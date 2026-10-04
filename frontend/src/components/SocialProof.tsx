import type { Product } from '../types'

// Shows social-proof stats for a product: how many shoppers have it in their cart (scaled
// from the number of registered logins) and how many bought it in the past week.
export default function SocialProof({ social }: { social?: Product['social'] }) {
  if (!social) return null
  const { in_carts, purchased_last_week } = social
  return (
    <div className="social-proof" aria-label="Shopper activity">
      <span className="social-stat">
        🛒 <strong>{in_carts}</strong> {in_carts === 1 ? 'shopper has' : 'shoppers have'} this in their cart
      </span>
      <span className="social-stat">
        🔥 <strong>{purchased_last_week}</strong> bought this in the past week
      </span>
    </div>
  )
}
