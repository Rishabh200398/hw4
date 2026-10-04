import { Link } from 'react-router-dom'
import YaleCampusArt from '../components/YaleCampusArt'

const values = [
  {
    title: 'Officially licensed',
    text: 'Everything we sell carries an official Yale license, so the logos, marks and colors are the real thing.',
  },
  {
    title: 'Made in New Haven',
    text: 'Screen printing and embroidery happen in-house at our Broadway store, not in a warehouse across the country.',
  },
  {
    title: 'Built for the whole community',
    text: 'From the 14 residential colleges to varsity teams and graduate schools, we try to make gear for every corner of Yale.',
  },
  {
    title: 'Honest help',
    text: "Our team and our online assistant will always tell you the true price and whether your size is in stock — no guesswork.",
  },
]

export default function About() {
  return (
    <>
      <section className="page-hero">
        <h1>About Campus Customs</h1>
        <p>A local shop with one job: helping the Yale community show its colors.</p>
      </section>

      <section className="section prose">
        <h2>Our story</h2>
        <p>
          Campus Customs is a Connecticut-based company that makes college apparel, and our Yale Bulldog Blue line is
          the heart of what we do. Our New Haven store sits at 57 Broadway, just steps from campus, in the building that
          was once home to the York Square Cinema.
        </p>
        <p>
          Instead of shipping in finished goods, we set up our store as a working shop. Much of the space is given over
          to screen printers and embroidery machines, which means we decorate garments on-site, try out new designs
          quickly and get them onto the shelves fast.
        </p>
        <p>
          Whether you're a first-year picking out your college colors, a parent heading to Family Weekend, an alum
          coming back for reunion or a fan headed to The Game, we want you to find something you're proud to wear.
        </p>
      </section>

      <section className="section">
        <h2>From one corner of Yale to another</h2>
        <YaleCampusArt />
        <p className="muted campus-caption">
          We make gear for every school at Yale — and this storefront is dressed in the colors of two we
          especially love: the <strong>Yale School of Management</strong> and the <strong>Yale School of the
          Environment</strong>. Shout-out to the dual-degree students bridging business and the planet; honestly,
          some of the coolest people on campus. Navy for SOM, green for YSE, Bulldog pride for everyone.
        </p>
      </section>

      <section className="section">
        <h2>What we stand for</h2>
        <div className="audience-grid">
          {values.map((v) => (
            <div key={v.title} className="audience-card">
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section band">
        <div className="band-inner">
          <div>
            <h2>Come see us</h2>
            <p>
              57 Broadway, New Haven, CT 06511 — or browse the full catalogue online.
            </p>
          </div>
          <Link to="/products" className="btn btn-accent">Browse products</Link>
        </div>
      </section>
    </>
  )
}
