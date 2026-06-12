import { useState } from "react";

export const AMENITY_OPTIONS = [
  "wifi",
  "pool",
  "aircon",
  "breakfast",
  "parking",
  "beachfront",
  "balcony",
  "kitchenette",
  "minibar",
];

function FilterSidebar({ onApply, initial = {} }) {
  const [minPrice, setMinPrice] = useState(initial.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice || "");
  const [rating, setRating] = useState(initial.rating || "");
  const [amenities, setAmenities] = useState(
    initial.amenities ? initial.amenities.split(",") : []
  );

  const toggleAmenity = (amenity) =>
    setAmenities((current) =>
      current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity]
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply({
      minPrice,
      maxPrice,
      rating,
      amenities: amenities.join(","),
    });
  };

  const handleClear = () => {
    setMinPrice("");
    setMaxPrice("");
    setRating("");
    setAmenities([]);
    onApply({ minPrice: "", maxPrice: "", rating: "", amenities: "" });
  };

  return (
    <form className="filter-sidebar" onSubmit={handleSubmit}>
      <h3>Filters</h3>

      <fieldset>
        <legend>Price per night (₱)</legend>
        <div className="filter-price-row">
          <input
            type="number"
            placeholder="Min"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            aria-label="Minimum price"
          />
          <span>–</span>
          <input
            type="number"
            placeholder="Max"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-label="Maximum price"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>Minimum rating</legend>
        <select value={rating} onChange={(e) => setRating(e.target.value)} aria-label="Minimum rating">
          <option value="">Any</option>
          <option value="3">3+ stars</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>
      </fieldset>

      <fieldset>
        <legend>Amenities</legend>
        {AMENITY_OPTIONS.map((amenity) => (
          <label key={amenity} className="filter-checkbox">
            <input
              type="checkbox"
              checked={amenities.includes(amenity)}
              onChange={() => toggleAmenity(amenity)}
            />
            {amenity}
          </label>
        ))}
      </fieldset>

      <button type="submit" className="btn btn-primary btn-block">
        Apply filters
      </button>
      <button type="button" className="btn btn-outline btn-block" onClick={handleClear}>
        Clear
      </button>
    </form>
  );
}

export default FilterSidebar;
