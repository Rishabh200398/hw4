import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface PageContextValue {
  route: string | null
  product_id: string | null
  product_name: string | null
  visible_product_ids: string[]
}

interface Store {
  context: PageContextValue
  setProduct: (product_id: string, product_name: string) => void
  setVisible: (ids: string[]) => void
  reset: () => void
}

const empty: PageContextValue = { route: null, product_id: null, product_name: null, visible_product_ids: [] }
const PageContextCtx = createContext<Store | null>(null)

// Tracks what the shopper is currently looking at, so the chat widget can tell the
// agent (e.g. "on the Basic Hoodie page") and "do you have this in pink?" resolves.
export function PageContextProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<PageContextValue>(empty)

  // Stable callbacks so effects in pages/widgets that depend on them don't loop.
  const setProduct = useCallback(
    (product_id: string, product_name: string) => setContext((c) => ({ ...c, product_id, product_name })),
    [],
  )
  const setVisible = useCallback(
    (ids: string[]) =>
      setContext((c) =>
        c.visible_product_ids.join(',') === ids.join(',') ? c : { ...c, visible_product_ids: ids },
      ),
    [],
  )
  const reset = useCallback(() => setContext(empty), [])

  const value = useMemo(() => ({ context, setProduct, setVisible, reset }), [context, setProduct, setVisible, reset])

  return <PageContextCtx.Provider value={value}>{children}</PageContextCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePageContext() {
  const ctx = useContext(PageContextCtx)
  if (!ctx) throw new Error('usePageContext must be used inside PageContextProvider')
  return ctx
}

// Convenience hook for a product page: register the viewed product, clear on leave.
// eslint-disable-next-line react-refresh/only-export-components
export function useSetViewedProduct(product_id: string | null, product_name: string | null) {
  const { setProduct, reset } = usePageContext()
  useEffect(() => {
    if (product_id && product_name) setProduct(product_id, product_name)
    return () => reset()
  }, [product_id, product_name, setProduct, reset])
}
