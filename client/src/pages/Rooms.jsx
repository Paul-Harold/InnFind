import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import SearchBar from "../components/SearchBar.jsx";
import FilterSidebar from "../components/FilterSidebar.jsx";
import RoomCard from "../components/RoomCard.jsx";

function Rooms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const city = searchParams.get("city") || "";

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = {};
    ["city", "minPrice", "maxPrice", "guests", "amenities", "rating"].forEach((key) => {
      const value = searchParams.get(key);
      if (value) params[key] = value;
    });
    api
      .get("/rooms", { params })
      .then((res) => setRooms(res.data.rooms))
      .catch(() => setError("Could not load rooms. Is the API running?"))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const applyFilters = (filters) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next);
  };

  return (
    <main className="page rooms-page">
      <SearchBar
        initial={{
          city,
          checkIn: searchParams.get("checkIn") || "",
          checkOut: searchParams.get("checkOut") || "",
          guests: searchParams.get("guests") || 1,
        }}
      />

      <div className="rooms-layout">
        <FilterSidebar
          onApply={applyFilters}
          initial={{
            minPrice: searchParams.get("minPrice") || "",
            maxPrice: searchParams.get("maxPrice") || "",
            rating: searchParams.get("rating") || "",
            amenities: searchParams.get("amenities") || "",
          }}
        />

        <section className="rooms-results">
          <h1 className="section-title">
            {city ? `Stays in “${city}”` : "All stays"}
            {!loading && <span className="muted result-count"> · {rooms.length} found</span>}
          </h1>

          {loading && <p className="muted">Loading rooms…</p>}
          {error && <div className="form-error">{error}</div>}

          {!loading && !error && rooms.length === 0 && (
            <div className="empty-state">
              <p>No rooms match your search.</p>
              <p className="muted">Try another city or loosen the filters.</p>
            </div>
          )}

          <div className="room-grid">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Rooms;
