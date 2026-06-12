import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { todayStr } from "../utils/format.js";

function SearchBar({ initial = {} }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    city: initial.city || "",
    checkIn: initial.checkIn || "",
    checkOut: initial.checkOut || "",
    guests: initial.guests || 1,
  });

  const handleChange = (e) =>
    setSearch({ ...search, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(search).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-field">
        <label htmlFor="city">Where</label>
        <input
          id="city"
          name="city"
          type="text"
          placeholder="City or destination"
          value={search.city}
          onChange={handleChange}
        />
      </div>
      <div className="search-field">
        <label htmlFor="checkIn">Check-in</label>
        <input
          id="checkIn"
          name="checkIn"
          type="date"
          min={todayStr()}
          value={search.checkIn}
          onChange={handleChange}
        />
      </div>
      <div className="search-field">
        <label htmlFor="checkOut">Check-out</label>
        <input
          id="checkOut"
          name="checkOut"
          type="date"
          min={search.checkIn || todayStr()}
          value={search.checkOut}
          onChange={handleChange}
        />
      </div>
      <div className="search-field search-field-small">
        <label htmlFor="guests">Guests</label>
        <input
          id="guests"
          name="guests"
          type="number"
          min="1"
          max="10"
          value={search.guests}
          onChange={handleChange}
        />
      </div>
      <button type="submit" className="btn btn-primary search-submit">
        Search
      </button>
    </form>
  );
}

export default SearchBar;
