import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../cart'
import { useAuth } from '../auth'

const mainLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About Us' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { user, logout } = useAuth()
  const close = () => setOpen(false)

  return (
    <header className="site-header">
      <div className="announcement">Official Yale-licensed apparel · Printed and stitched in New Haven</div>
      <nav className="navbar" aria-label="Main">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">CC</span>
          <span className="brand-text">
            Campus Customs
            <small>Yale Bulldog Blue</small>
          </span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          {mainLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={close} className="nav-link">
              {link.label}
            </NavLink>
          ))}
          <div className="nav-account">
            <NavLink to="/cart" onClick={close} className="nav-link cart-link" aria-label={`Cart, ${count} items`}>
              🛒 Cart{count > 0 && <span className="cart-badge">{count}</span>}
            </NavLink>
            {user ? (
              <>
                <span className="nav-greeting">Hi, {user.first_name || user.name}</span>
                <button
                  type="button"
                  className="btn btn-accent btn-small"
                  onClick={() => {
                    logout()
                    close()
                  }}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={close} className="nav-link">
                  Log In
                </NavLink>
                <NavLink to="/create-account" onClick={close} className="btn btn-accent btn-small">
                  Create Account
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
