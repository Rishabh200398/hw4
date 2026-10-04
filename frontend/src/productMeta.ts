// Shared helpers for filtering: turning each product's free-text garment_type into a
// tidy category, and the price ranges offered in the filter.
import type { Product } from './types'

export const CATEGORY_ORDER = [
  'Hoodies',
  'Crewnecks',
  'T-Shirts',
  'Quarter-Zips',
  'Jackets & Fleece',
  'Other',
] as const

export type Category = (typeof CATEGORY_ORDER)[number]

// garment_type is inconsistent (22 variants), so map each to one clean category.
export function categoryOf(product: Product): Category {
  const g = product.garment_type.toLowerCase()
  if (g.includes('hood')) return 'Hoodies'
  if (g.includes('jacket') || g.includes('fleece')) return 'Jackets & Fleece'
  if (g.includes('zip') || g.includes('1/4')) return 'Quarter-Zips'
  if (g.includes('t-shirt') || g.includes('tee') || g.includes('shirt')) return 'T-Shirts'
  if (g.includes('crew')) return 'Crewnecks'
  return 'Other'
}

export interface PriceRange {
  key: string
  label: string
  test: (price: number) => boolean
}

export const PRICE_RANGES: PriceRange[] = [
  { key: 'under40', label: 'Under $40', test: (p) => p < 40 },
  { key: '40-59', label: '$40 – $59', test: (p) => p >= 40 && p < 60 },
  { key: '60-79', label: '$60 – $79', test: (p) => p >= 60 && p < 80 },
  { key: '80plus', label: '$80 & up', test: (p) => p >= 80 },
]
