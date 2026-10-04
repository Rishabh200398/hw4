import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { marked } from 'marked'
import { useChatResults } from '../chatResults'
import BulldogAvatar from './BulldogAvatar'
import { useAuth } from '../auth'
import { usePageContext } from '../pageContext'
import type { ChatProduct } from '../types'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  products?: ChatProduct[]
}

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: "Woof! I’m **Handsome Dan**, your Campus Customs guide. 🐾 Tell me what Yale gear you’re after — a hoodie, a gift, a size check — and I’ll sniff out the good stuff.",
}

function renderMarkdown(text: string): string {
  return marked.parse(text, { async: false }) as string
}

// Floating chat panel shown on every page, wired to the PydanticAI agent at /api/chat.
export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const { setMatches } = useChatResults()
  const { user } = useAuth()
  const { context } = usePageContext()
  const location = useLocation()
  const token = user?.token

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, open, sending])

  // Load saved history when a shopper logs in; reset to a fresh welcome on logout.
  useEffect(() => {
    if (!token) {
      setMessages([WELCOME])
      return
    }
    let cancelled = false
    fetch('/api/chat/history', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : { messages: [] }))
      .then((data) => {
        if (cancelled) return
        const restored: ChatMessage[] = (data.messages ?? []).map(
          (m: { role: 'user' | 'assistant'; content: string; products?: ChatProduct[] }) => ({
            role: m.role,
            content: m.content,
            products: m.products ?? [],
          }),
        )
        setMessages([WELCOME, ...restored])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [token])

  async function send(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    // The history the agent should see (everything before this new message).
    const history = messages
      .filter((m) => m !== WELCOME)
      .map((m) => ({ role: m.role, content: m.content }))

    // What the shopper is currently looking at, so "do you have this in pink?" resolves.
    const page_context = {
      route: location.pathname,
      product_id: context.product_id,
      product_name: context.product_name,
      visible_product_ids: context.visible_product_ids,
    }

    setMessages((m) => [...m, { role: 'user', content: text }])
    setDraft('')
    setSending(true)

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, history, page_context }),
      })
      if (!res.ok) {
        const detail = (await res.json().catch(() => null))?.detail
        throw new Error(typeof detail === 'string' ? detail : `Request failed (${res.status})`)
      }
      const data = await res.json()
      setMessages((m) => [...m, { role: 'assistant', content: data.reply, products: data.products }])
      if (Array.isArray(data.products) && data.products.length > 0) {
        setMatches(data.products, text, location.pathname)
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            err instanceof Error && err.message
              ? `Sorry — ${err.message}`
              : "Sorry, I couldn't reach the assistant just now. Please try again.",
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat with Campus Customs">
          <div className="chat-header">
            <div className="chat-header-id">
              <span className="chat-avatar"><BulldogAvatar size={38} /></span>
              <div>
                <strong>Handsome Dan</strong>
                <small>Your Campus Customs guide</small>
              </div>
            </div>
            <button className="chat-close" aria-label="Close chat" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          <div className="chat-messages" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-row ${m.role}`}>
                <div
                  className={`chat-bubble ${m.role}`}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                />
                {m.products && m.products.length > 0 && (
                  <div className="chat-products">
                    {m.products.map((p) => (
                      <Link
                        key={p.product_id}
                        to={`/products/${p.product_id}`}
                        className="chat-product"
                        onClick={() => setOpen(false)}
                      >
                        <img src={p.image_url} alt={p.name} loading="lazy" />
                        <span className="chat-product-name">{p.name}</span>
                        <span className="chat-product-price">${p.price.toFixed(2)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="chat-row assistant">
                <div className="chat-bubble assistant typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
          <form className="chat-input" onSubmit={send}>
            <input
              placeholder="Type a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Message"
              disabled={sending}
            />
            <button className="btn btn-primary btn-small" disabled={!draft.trim() || sending}>
              Send
            </button>
          </form>
        </div>
      )}
      <button
        className="chat-launcher"
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? '×' : <BulldogAvatar size={40} />}
      </button>
    </div>
  )
}
