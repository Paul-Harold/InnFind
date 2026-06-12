import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { formatPrice } from "../../utils/format.js";

const EMPTY_FORM = {
  name: "",
  city: "",
  address: "",
  description: "",
  photos: "",
  amenities: "",
  featured: false,
};

// Comma-separated text fields → arrays for the API.
const toPayload = (form) => ({
  ...form,
  photos: form.photos.split(",").map((s) => s.trim()).filter(Boolean),
  amenities: form.amenities.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
});

function ManageHotels() {
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState(null); // null = closed, {} = create, {_id} = edit
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get("/hotels").then((res) => setHotels(res.data.hotels));
  };

  useEffect(load, []);

  const startEdit = (hotel) =>
    setForm({
      _id: hotel._id,
      name: hotel.name,
      city: hotel.city,
      address: hotel.address,
      description: hotel.description,
      photos: hotel.photos.join(", "),
      amenities: hotel.amenities.join(", "),
      featured: hotel.featured,
    });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (form._id) {
        await api.put(`/hotels/${form._id}`, toPayload(form));
      } else {
        await api.post("/hotels", toPayload(form));
      }
      setForm(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the hotel.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (hotel) => {
    if (!window.confirm(`Delete "${hotel.name}" and all its rooms, bookings, and reviews?`))
      return;
    try {
      await api.delete(`/hotels/${hotel._id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the hotel.");
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Hotels ({hotels.length})</h2>
        <button type="button" className="btn btn-primary" onClick={() => setForm(EMPTY_FORM)}>
          + Add hotel
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {form && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{form._id ? "Edit hotel" : "New hotel"}</h3>
          <div className="admin-form-grid">
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              City
              <input name="city" value={form.city} onChange={handleChange} required />
            </label>
            <label className="span-2">
              Address
              <input name="address" value={form.address} onChange={handleChange} required />
            </label>
            <label className="span-2">
              Description
              <textarea
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
                required
              />
            </label>
            <label className="span-2">
              Photo URLs (comma-separated)
              <textarea name="photos" rows="2" value={form.photos} onChange={handleChange} />
            </label>
            <label className="span-2">
              Amenities (comma-separated)
              <input name="amenities" value={form.amenities} onChange={handleChange} />
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
              />
              Featured on homepage
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setForm(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>City</th>
            <th>From</th>
            <th>Rating</th>
            <th>Featured</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {hotels.map((hotel) => (
            <tr key={hotel._id}>
              <td>{hotel.name}</td>
              <td>{hotel.city}</td>
              <td>{formatPrice(hotel.cheapestPrice)}</td>
              <td>{hotel.numReviews > 0 ? `★ ${hotel.rating}` : "—"}</td>
              <td>{hotel.featured ? "Yes" : ""}</td>
              <td className="admin-row-actions">
                <button type="button" className="btn btn-outline" onClick={() => startEdit(hotel)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(hotel)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageHotels;
