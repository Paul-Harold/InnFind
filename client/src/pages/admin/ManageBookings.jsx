import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { formatPrice, formatDate } from "../../utils/format.js";

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/bookings")
      .then((res) => setBookings(res.data.bookings))
      .catch(() => setError("Could not load bookings."))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (booking, status) => {
    setError("");
    try {
      const res = await api.put(`/bookings/${booking._id}/status`, { status });
      setBookings((current) =>
        current.map((b) => (b._id === booking._id ? res.data.booking : b))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not update the booking.");
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Bookings ({bookings.length})</h2>
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading && <p className="muted">Loading…</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Receipt</th>
            <th>Guest</th>
            <th>Stay</th>
            <th>Dates</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id}>
              <td>{booking.receiptNumber}</td>
              <td>
                {booking.user?.name}
                <br />
                <span className="muted">{booking.user?.email}</span>
              </td>
              <td>
                {booking.hotel?.name}
                <br />
                <span className="muted">{booking.room?.title}</span>
              </td>
              <td>
                {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
              </td>
              <td>{formatPrice(booking.totalPrice)}</td>
              <td>
                <select
                  className={`status-select status-${booking.status}`}
                  value={booking.status}
                  onChange={(e) => handleStatusChange(booking, e.target.value)}
                >
                  <option value="confirmed">confirmed</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
            </tr>
          ))}
          {!loading && bookings.length === 0 && (
            <tr>
              <td colSpan="6" className="muted">
                No bookings yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManageBookings;
