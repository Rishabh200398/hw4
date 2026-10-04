import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Product } from './types'

interface ChatResultsValue {
  matches: Product[]
  query: string
  originPath: string // the page the shopper was on when these matches were produced
  setMatches: (products: Product[], query: string, originPath: string) => void
  clear: () => void
}

const ChatResultsContext = createContext<ChatResultsValue | null>(null)

// Holds the product matches the agent most recently surfaced, plus the page they were
// produced on, so the on-page band only shows there (not on every route).
export function ChatResultsProvider({ children }: { children: ReactNode }) {
  const [matches, setMatchesState] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [originPath, setOriginPath] = useState('')

  return (
    <ChatResultsContext.Provider
      value={{
        matches,
        query,
        originPath,
        setMatches: (products, q, path) => {
          setMatchesState(products)
          setQuery(q)
          setOriginPath(path)
        },
        clear: () => {
          setMatchesState([])
          setQuery('')
          setOriginPath('')
        },
      }}
    >
      {children}
    </ChatResultsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChatResults() {
  const ctx = useContext(ChatResultsContext)
  if (!ctx) throw new Error('useChatResults must be used inside ChatResultsProvider')
  return ctx
}
