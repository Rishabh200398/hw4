import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4>Campus Customs</h4>
          <p>Officially licensed Yale gear, made a few blocks from campus.</p>
        </div>
        <div>
          <h4>Visit</h4>
          <p>
            57 Broadway
            <br />
            New Haven, CT 06511
          </p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/products">All products</Link></li>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/create-account">Create an account</Link></li>
          </ul>
        </div>
      </div>
      <p className="footer-bottom">© 2026 Campus Customs · Class project, not the official store</p>
    </footer>
  )
}
