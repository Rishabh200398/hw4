export interface SizeStock {
  size: string
  quantity: number
}

// Mirrors the catalogue + inventory tables in campus_customs.db.
export interface Product {
  product_id: string
  name: string
  garment_type: string
  description: string
  colors: string[]
  search_tags: string[]
  image_file_path: string
  image_url: string
  price: number
  inventory: SizeStock[]
  total_stock: number
  social?: { in_carts: number; purchased_last_week: number }
}

export interface CartItem {
  product_id: string
  name: string
  price: number
  image_url: string
  size: string
  quantity: number
}

// The chat endpoint returns products in the same shape as the catalogue.
export type ChatProduct = Product
