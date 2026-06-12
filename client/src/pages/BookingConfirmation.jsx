import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";
import { formatPrice, formatDate } from "../utils/format.js";

function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/bookings/${id}`)
      .then((res) => setBooking(res.data.booking))
      .catch((err) => setError(err.response?.data?.message || "Could not load this booking."));
  }, [id]);

  if (error) return <main className="page"><div className="form-error">{error}</div></main>;
  if (!booking) return <main className="page"><p className="muted">Loading…</p></main>;

  const isCancelled = booking.status === "cancelled";

  return (
    <main className="page confirmation-page">
      {!isCancelled && (
        <div className="confirmation-banner no-print">
          <h1>Booking confirmed 🎉</h1>
          <p className="muted">A copy of your receipt is below.</p>
        </div>
      )}

      <div className="receipt">
        <div className="receipt-header">
          <div>
            <h2>StaySphere</h2>
            <p className="muted">Booking receipt</p>
          </div>
          <div className="receipt-meta">
            <p><strong>{booking.receiptNumber}</strong></p>
            <p className="muted">Issued {formatDate(booking.createdAt)}</p>
            <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
          </div>
        </div>

        <div className="receipt-section">
          <h3>{booking.hotel.name}</h3>
          <p className="muted">{booking.hotel.address}, {booking.hotel.city}</p>
          <p>{booking.room.title}</p>
        </div>

        <div className="receipt-grid">
          <div>
            <p className="muted">Guest</p>
            <p>{booking.user.name}</p>
          </div>
          <div>
            <p className="muted">Guests</p>
            <p>{booking.guests}</p>
          </div>
          <div>
            <p className="muted">Check-in</p>
            <p>{formatDate(booking.checkIn)}</p>
          </div>
          <div>
            <p className="muted">Check-out</p>
            <p>{formatDate(booking.checkOut)}</p>
          </div>
        </div>

        <table className="receipt-table">
          <tbody>
            <tr>
              <td>
                {formatPrice(booking.room.pricePerNight)} × {booking.nights} night
                {booking.nights > 1 ? "s" : ""}
              </td>
              <td>{formatPrice(booking.totalPrice)}</td>
            </tr>
            <tr className="receipt-total">
              <td>Total</td>
              <td>{formatPrice(booking.totalPrice)}</td>
            </tr>
          </tbody>
        </table>

        <p className="muted receipt-footnote">
          Payment is settled at the property. Show this receipt at check-in.
        </p>
      </div>

      <div className="confirmation-actions no-print">
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          Print receipt
        </button>
        <Link to="/dashboard" className="btn btn-outline">
          My bookings
        </Link>
      </div>
    </main>
  );
}

export default BookingConfirmation;
