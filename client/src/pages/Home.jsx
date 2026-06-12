import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import SearchBar from "../components/SearchBar.jsx";
import { formatPrice } from "../utils/format.js";

const img = (id, w = 900) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

const DESTINATIONS = [
  { city: "Boracay", tagline: "White-sand beaches", photo: img("photo-1571896349842-33c89424de2d") },
  { city: "El Nido", tagline: "Island lagoons", photo: img("photo-1520250497591-112f2f40a3f4") },
  { city: "Manila", tagline: "City lights & history", photo: img("photo-1566073771259-6a8506099945") },
  { city: "Cebu", tagline: "Urban island living", photo: img("photo-1542314831-068cd1dbfeeb") },
  { city: "Baguio", tagline: "Cool mountain air", photo: img("photo-1551882547-ff40c63fe5fa") },
  { city: "Siargao", tagline: "Surf & island life", photo: img("photo-1445019980597-93fa8acb246c") },
];

const FEATURES = [
  {
    icon: "💸",
    title: "Pay at the property",
    text: "No prepayment, no booking fees. Reserve now and settle the bill at check-in.",
  },
  {
    icon: "⭐",
    title: "Reviews you can trust",
    text: "Only guests who completed a stay can leave a review — no fakes, no bots.",
  },
  {
    icon: "🕐",
    title: "Free cancellation",
    text: "Plans change. Cancel any upcoming booking from your dashboard at no cost.",
  },
  {
    icon: "🏝️",
    title: "Local favorites",
    text: "Hand-picked stays across the Philippines, from beach villas to mountain lodges.",
  },
];

const STEPS = [
  { step: "1", title: "Search", text: "Pick a destination, your dates, and how many are coming." },
  { step: "2", title: "Book", text: "Choose a room, confirm, and get your receipt instantly." },
  { step: "3", title: "Enjoy", text: "Show your receipt at check-in and start your stay." },
];

function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api
      .get("/hotels", { params: { featured: true } })
      .then((res) => setFeatured(res.data.hotels || []))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <main>
      <section className="hero hero-landing">
        <div className="hero-inner">
          <h1>Your next stay, found.</h1>
          <p>
            Beachfronts, city escapes, and mountain lodges across the Philippines —
            book in minutes, pay at the property.
          </p>
          <SearchBar />
        </div>
      </section>

      <section className="page">
        <h2 className="section-title">Top destinations</h2>
        <div className="destination-grid">
          {DESTINATIONS.map(({ city, tagline, photo }) => (
            <Link
              key={city}
              to={`/rooms?city=${encodeURIComponent(city)}`}
              className="destination-card"
              style={{ backgroundImage: `url(${photo})` }}
            >
              <div className="destination-overlay">
                <h3>{city}</h3>
                <p>{tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="page">
          <h2 className="section-title">Featured stays</h2>
          <div className="hotel-grid">
            {featured.map((hotel) => (
              <Link
                key={hotel._id}
                to={`/rooms?city=${encodeURIComponent(hotel.city)}`}
                className="hotel-card"
              >
                <div
                  className="hotel-card-photo"
                  style={{ backgroundImage: `url(${hotel.photos[0]})` }}
                />
                <div className="hotel-card-body">
                  <div className="room-card-top">
                    <h3>{hotel.name}</h3>
                    {hotel.numReviews > 0 && (
                      <span className="rating-badge">★ {hotel.rating.toFixed(1)}</span>
                    )}
                  </div>
                  <p className="muted">{hotel.city}</p>
                  <p className="room-card-price">
                    from <strong>{formatPrice(hotel.cheapestPrice)}</strong> / night
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="features-band">
        <div className="page">
          <h2 className="section-title">Why book with InnFind</h2>
          <div className="feature-grid">
            {FEATURES.map(({ icon, title, text }) => (
              <div key={title} className="feature-card">
                <span className="feature-icon" aria-hidden="true">{icon}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page">
        <h2 className="section-title">How it works</h2>
        <div className="steps-grid">
          {STEPS.map(({ step, title, text }) => (
            <div key={step} className="step-card">
              <span className="step-number">{step}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <h2>Ready for your next getaway?</h2>
        <p>24 rooms across 8 destinations are waiting.</p>
        <Link to="/rooms" className="btn btn-light">
          Browse all stays
        </Link>
      </section>
    </main>
  );
}

export default Home;
