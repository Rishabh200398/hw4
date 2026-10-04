import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="page-hero">
      <h1>Page not found</h1>
      <p>
        That page wandered off campus. <Link to="/" className="text-link light">Head back home</Link>.
      </p>
    </section>
  )
}
