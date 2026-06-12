import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { formatPrice } from "../../utils/format.js";

const EMPTY_FORM = {
  title: "",
  description: "",
  pricePerNight: "",
  maxGuests: 2,
  photos: "",
  amenities: "",
};

const toPayload = (form) => ({
  ...form,
  pricePerNight: Number(form.pricePerNight),
  maxGuests: Number(form.maxGuests),
  photos: form.photos.split(",").map((s) => s.trim()).filter(Boolean),
  amenities: form.amenities.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
});

function ManageRooms() {
  const [hotels, setHotels] = useState([]);
  const [hotelId, setHotelId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/hotels").then((res) => {
      setHotels(res.data.hotels);
      if (res.data.hotels.length > 0) setHotelId(res.data.hotels[0]._id);
    });
  }, []);

  const loadRooms = () => {
    if (!hotelId) return;
    api.get(`/hotels/${hotelId}`).then((res) => setRooms(res.data.rooms));
  };

  useEffect(loadRooms, [hotelId]);

  const startEdit = (room) =>
    setForm({
      _id: room._id,
      title: room.title,
      description: room.description,
      pricePerNight: room.pricePerNight,
      maxGuests: room.maxGuests,
      photos: room.photos.join(", "),
      amenities: room.amenities.join(", "),
    });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (form._id) {
        await api.put(`/rooms/${form._id}`, toPayload(form));
      } else {
        await api.post("/rooms", { ...toPayload(form), hotelId });
      }
      setForm(null);
      loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the room.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Delete "${room.title}" and its bookings?`)) return;
    try {
      await api.delete(`/rooms/${room._id}`);
      loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the room.");
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <label className="admin-hotel-select">
          Hotel
          <select value={hotelId} onChange={(e) => setHotelId(e.target.value)}>
            {hotels.map((hotel) => (
              <option key={hotel._id} value={hotel._id}>
                {hotel.name} — {hotel.city}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setForm(EMPTY_FORM)}
          disabled={!hotelId}
        >
          + Add room
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {form && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{form._id ? "Edit room" : "New room"}</h3>
          <div className="admin-form-grid">
            <label className="span-2">
              Title
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>
            <label className="span-2">
              Description
              <textarea
                name="description"
                rows="2"
                value={form.description}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Price per night (₱)
              <input
                name="pricePerNight"
                type="number"
                min="0"
                value={form.pricePerNight}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Max guests
              <input
                name="maxGuests"
                type="number"
                min="1"
                value={form.maxGuests}
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
            <th>Room</th>
            <th>Price / night</th>
            <th>Max guests</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room._id}>
              <td>{room.title}</td>
              <td>{formatPrice(room.pricePerNight)}</td>
              <td>{room.maxGuests}</td>
              <td className="admin-row-actions">
                <button type="button" className="btn btn-outline" onClick={() => startEdit(room)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(room)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {rooms.length === 0 && (
            <tr>
              <td colSpan="4" className="muted">
                No rooms for this hotel yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManageRooms;
