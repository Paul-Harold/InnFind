import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import SearchBar from "../components/SearchBar.jsx";
import { formatPrice } from "../utils/format.js";

function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api
      .get("/hotels", { params: { featured: true } })
      .then((res) => setFeatured(res.data.hotels))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <main>
      <section className="hero">
        <h1>Find your next stay</h1>
        <p>Beachfronts, city escapes, and mountain lodges across the Philippines.</p>
        <SearchBar />
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
                  <h3>{hotel.name}</h3>
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
    </main>
  );
}

export default Home;
