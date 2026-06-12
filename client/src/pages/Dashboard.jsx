import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import useAuth from "../hooks/useAuth.js";
import { formatPrice, formatDate } from "../utils/format.js";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Past stays" },
  { key: "cancelled", label: "Cancelled" },
];

function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    api
      .get("/bookings/my")
      .then((res) => setBookings(res.data.bookings))
      .catch(() => setError("Could not load your bookings."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancellingId(id);
    setError("");
    try {
      await api.put(`/bookings/${id}/cancel`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel the booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const byTab = {
    upcoming: bookings.filter((b) => b.status === "confirmed"),
    completed: bookings.filter((b) => b.status === "completed"),
    cancelled: bookings.filter((b) => b.status === "cancelled"),
  };
  const visible = byTab[tab];

  return (
    <main className="page">
      <h1>My Bookings</h1>
      <p className="muted">Logged in as {user.name}</p>

      <div className="tabs">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`tab ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label} ({byTab[key].length})
          </button>
        ))}
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading && <p className="muted">Loading…</p>}

      {!loading && visible.length === 0 && (
        <div className="empty-state">
          <p>Nothing here yet.</p>
          {tab === "upcoming" && (
            <p className="muted">
              <Link to="/rooms">Browse rooms</Link> to plan your next stay.
            </p>
          )}
        </div>
      )}

      <div className="booking-list">
        {visible.map((booking) => (
          <article key={booking._id} className="booking-card">
            <div
              className="booking-card-photo"
              style={{ backgroundImage: `url(${booking.room?.photos?.[0]})` }}
            />
            <div className="booking-card-body">
              <div className="booking-card-top">
                <h3>{booking.room?.title}</h3>
                <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
              </div>
              <p className="muted">
                {booking.hotel?.name} · {booking.hotel?.city}
              </p>
              <p>
                {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)} ·{" "}
                {booking.guests} guest{booking.guests > 1 ? "s" : ""}
              </p>
              <p className="booking-card-price">
                <strong>{formatPrice(booking.totalPrice)}</strong>
                <span className="muted"> · {booking.receiptNumber}</span>
              </p>
              <div className="booking-card-actions">
                <Link to={`/booking-confirmation/${booking._id}`} className="btn btn-outline">
                  View receipt
                </Link>
                {booking.status === "completed" && (
                  <Link to={`/rooms/${booking.room?._id}`} className="btn btn-primary">
                    Review your stay
                  </Link>
                )}
                {booking.status === "confirmed" && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleCancel(booking._id)}
                    disabled={cancellingId === booking._id}
                  >
                    {cancellingId === booking._id ? "Cancelling…" : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Dashboard;
