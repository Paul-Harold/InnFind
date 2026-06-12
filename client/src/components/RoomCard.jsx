import { Link, useSearchParams } from "react-router-dom";
import { formatPrice } from "../utils/format.js";

function RoomCard({ room }) {
  const [searchParams] = useSearchParams();

  // Carry dates/guests into the detail page so the booking widget pre-fills.
  const stayParams = new URLSearchParams();
  ["checkIn", "checkOut", "guests"].forEach((key) => {
    const value = searchParams.get(key);
    if (value) stayParams.set(key, value);
  });
  const query = stayParams.toString();

  return (
    <Link to={`/rooms/${room._id}${query ? `?${query}` : ""}`} className="room-card">
      <div
        className="room-card-photo"
        style={{ backgroundImage: `url(${room.photos[0]})` }}
      />
      <div className="room-card-body">
        <div className="room-card-top">
          <span className="room-card-hotel">
            {room.hotel?.name} · {room.hotel?.city}
          </span>
          {room.hotel?.numReviews > 0 ? (
            <span className="rating-badge">★ {room.hotel.rating.toFixed(1)}</span>
          ) : (
            <span className="rating-badge rating-new">New</span>
          )}
        </div>
        <h3>{room.title}</h3>
        <p className="room-card-guests">Up to {room.maxGuests} guests</p>
        <p className="room-card-price">
          <strong>{formatPrice(room.pricePerNight)}</strong> / night
        </p>
      </div>
    </Link>
  );
}

export default RoomCard;
