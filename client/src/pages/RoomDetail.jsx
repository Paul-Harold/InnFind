import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import api from "../api/axios.js";
import useAuth from "../hooks/useAuth.js";
import Reviews from "../components/Reviews.jsx";
import { formatPrice, nightsBetween, todayStr } from "../utils/format.js";

function RoomDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mainPhoto, setMainPhoto] = useState(0);

  const [stay, setStay] = useState({
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    guests: Number(searchParams.get("guests")) || 1,
  });
  const [notice, setNotice] = useState("");
  const [available, setAvailable] = useState(null);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    api
      .get(`/rooms/${id}`)
      .then((res) => setRoom(res.data.room))
      .catch((err) =>
        setError(err.response?.status === 404 ? "Room not found." : "Could not load this room.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  // Live availability check whenever both dates are set.
  useEffect(() => {
    if (!stay.checkIn || !stay.checkOut || stay.checkOut <= stay.checkIn) {
      setAvailable(null);
      return;
    }
    api
      .get(`/rooms/availability/${id}`, {
        params: { checkIn: stay.checkIn, checkOut: stay.checkOut },
      })
      .then((res) => setAvailable(res.data.available))
      .catch(() => setAvailable(null));
  }, [id, stay.checkIn, stay.checkOut]);

  if (loading) return <main className="page"><p className="muted">Loading…</p></main>;
  if (error) return <main className="page"><div className="form-error">{error}</div></main>;

  const hotel = room.hotel;
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const total = nights * room.pricePerNight;
  const photos = [...room.photos, ...(hotel?.photos || [])];

  const handleReserve = async () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!stay.checkIn || !stay.checkOut || nights < 1) {
      setNotice("Pick valid check-in and check-out dates first.");
      return;
    }
    setNotice("");
    setReserving(true);
    try {
      const res = await api.post("/bookings", {
        roomId: id,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        guests: stay.guests,
      });
      navigate(`/booking-confirmation/${res.data.booking._id}`);
    } catch (err) {
      setNotice(err.response?.data?.message || "Could not complete the booking.");
    } finally {
      setReserving(false);
    }
  };

  return (
    <main className="page room-detail">
      <div className="gallery">
        <div
          className="gallery-main"
          style={{ backgroundImage: `url(${photos[mainPhoto]})` }}
        />
        {photos.length > 1 && (
          <div className="gallery-thumbs">
            {photos.map((photo, i) => (
              <button
                key={photo + i}
                type="button"
                className={`gallery-thumb ${i === mainPhoto ? "active" : ""}`}
                style={{ backgroundImage: `url(${photo})` }}
                onClick={() => setMainPhoto(i)}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="room-detail-layout">
        <section className="room-detail-info">
          <p className="muted room-detail-hotel">
            {hotel?.name} · {hotel?.city}
            {hotel?.numReviews > 0 && (
              <span className="rating-badge"> ★ {hotel.rating.toFixed(1)} ({hotel.numReviews})</span>
            )}
          </p>
          <h1>{room.title}</h1>
          <p className="muted">Up to {room.maxGuests} guests</p>
          <p className="room-detail-desc">{room.description}</p>

          <h2 className="section-title">Amenities</h2>
          <ul className="amenity-list">
            {[...new Set([...room.amenities, ...(hotel?.amenities || [])])].map((amenity) => (
              <li key={amenity}>{amenity}</li>
            ))}
          </ul>

          <h2 className="section-title">About {hotel?.name}</h2>
          <p className="muted">{hotel?.address}</p>
          <p>{hotel?.description}</p>

          <h2 className="section-title">Reviews</h2>
          <Reviews
            hotelId={hotel._id}
            onChanged={() =>
              api.get(`/rooms/${id}`).then((res) => setRoom(res.data.room))
            }
          />
        </section>

        <aside className="booking-widget">
          <p className="booking-price">
            <strong>{formatPrice(room.pricePerNight)}</strong> / night
          </p>

          <label htmlFor="checkIn">Check-in</label>
          <input
            id="checkIn"
            type="date"
            min={todayStr()}
            value={stay.checkIn}
            onChange={(e) => setStay({ ...stay, checkIn: e.target.value })}
          />

          <label htmlFor="checkOut">Check-out</label>
          <input
            id="checkOut"
            type="date"
            min={stay.checkIn || todayStr()}
            value={stay.checkOut}
            onChange={(e) => setStay({ ...stay, checkOut: e.target.value })}
          />

          <label htmlFor="guests">Guests</label>
          <input
            id="guests"
            type="number"
            min="1"
            max={room.maxGuests}
            value={stay.guests}
            onChange={(e) => setStay({ ...stay, guests: Number(e.target.value) })}
          />

          {nights > 0 && (
            <div className="booking-summary">
              <span>
                {formatPrice(room.pricePerNight)} × {nights} night{nights > 1 ? "s" : ""}
              </span>
              <strong>{formatPrice(total)}</strong>
            </div>
          )}

          {available === false && (
            <div className="form-error">This room is already booked for those dates.</div>
          )}
          {available === true && nights > 0 && (
            <div className="form-success">Available for your dates ✓</div>
          )}
          {notice && <div className="form-error">{notice}</div>}

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleReserve}
            disabled={reserving || available === false}
          >
            {reserving ? "Reserving…" : user ? "Reserve" : "Log in to reserve"}
          </button>
        </aside>
      </div>
    </main>
  );
}

export default RoomDetail;
