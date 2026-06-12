import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer no-print">
      <div className="footer-inner">
        <div>
          <p className="footer-brand">InnFind</p>
          <p className="muted">
            Hotel reservations across the Philippines.
            <br />
            Built as a full-stack portfolio project.
          </p>
        </div>
        <div className="footer-links">
          <p className="footer-heading">Explore</p>
          <Link to="/rooms">All stays</Link>
          <Link to="/rooms?city=Boracay">Boracay</Link>
          <Link to="/rooms?city=El Nido">El Nido</Link>
          <Link to="/rooms?city=Manila">Manila</Link>
        </div>
        <div className="footer-links">
          <p className="footer-heading">Account</p>
          <Link to="/login">Log in</Link>
          <Link to="/signup">Sign up</Link>
          <Link to="/dashboard">My bookings</Link>
        </div>
      </div>
      <p className="footer-copy muted">
        © {new Date().getFullYear()} InnFind. Demo project — bookings are not real.
      </p>
    </footer>
  );
}

export default Footer;
