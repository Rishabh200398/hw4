import { Link } from 'react-router-dom'

const categories = [
  { label: 'Hoodies', query: 'hoodie', blurb: 'Heavyweight pullovers and full-zips for New England winters.' },
  { label: 'Crewnecks', query: 'crewneck', blurb: 'The classic sweatshirt, from big block letters to small chest logos.' },
  { label: 'T-Shirts', query: 't-shirt', blurb: 'Everyday tees, game-day graphics and Harvard–Yale rivalry shirts.' },
  { label: 'Quarter-Zips', query: 'quarter-zip', blurb: 'A sharper layer for class, the office or a reunion weekend.' },
  { label: 'Jackets & Fleece', query: 'jacket', blurb: 'Bombers and fleeces for when the wind comes off the Sound.' },
]

const shopFor = [
  { title: 'Students', text: 'Your residential college, your team, your class year — wear it loud.' },
  { title: 'Parents & Family', text: 'Show up to Family Weekend dressed for the part.' },
  { title: 'Alumni', text: 'Reunion-ready gear that says you still bleed Yale blue.' },
  { title: 'Fans', text: 'Cheer on the Bulldogs from the stands at the Bowl or Ingalls.' },
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">New Haven's Yale outfitter</p>
          <h1>Wear your Bulldog pride every day.</h1>
          <p className="hero-sub">
            Comfortable, officially licensed Yale apparel — designed for students, families, alumni and fans, and
            printed right here in New Haven.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-accent">Shop all products</Link>
            <Link to="/about" className="btn btn-outline-light">Our story</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Shop by category</h2>
          <Link to="/products" className="text-link">See everything →</Link>
        </div>
        <div className="category-grid">
          {categories.map((c) => (
            <Link key={c.label} to={`/products?type=${encodeURIComponent(c.query)}`} className="category-card">
              <h3>{c.label}</h3>
              <p>{c.blurb}</p>
              <span className="text-link">Shop {c.label.toLowerCase()} →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section band">
        <div className="band-inner">
          <div>
            <h2>Not sure what to pick? Just ask.</h2>
            <p>
              Our shopping assistant knows every item in the store. Tell it what you're after — "a gray hoodie in a
              medium" or "a gift for a Yale dad" — and it will show you matching gear along with the real price and
              which sizes are in stock.
            </p>
          </div>
          <Link to="/create-account" className="btn btn-accent">Create an account to chat</Link>
        </div>
      </section>

      <section className="section">
        <h2>Gear for everyone in the Yale family</h2>
        <div className="audience-grid">
          {shopFor.map((s) => (
            <div key={s.title} className="audience-card">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section local">
        <h2>Made a few blocks from Old Campus</h2>
        <p>
          Every design is printed or embroidered in our own shop on Broadway, so we can turn around new styles quickly
          and keep a close eye on quality. Stop by and say hello next time you're in town.
        </p>
      </section>
    </>
  )
}
