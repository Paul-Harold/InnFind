import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import useAuth from "../hooks/useAuth.js";
import { formatDate } from "../utils/format.js";

const Stars = ({ value }) => (
  <span className="stars" aria-label={`${value} out of 5 stars`}>
    {"★".repeat(value)}
    {"☆".repeat(5 - value)}
  </span>
);

function Reviews({ hotelId, onChanged }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api
      .get(`/reviews/hotel/${hotelId}`)
      .then((res) => setReviews(res.data.reviews))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [hotelId]);

  const myReview = user && reviews.find((r) => r.user?._id === user._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!rating) {
      setError("Pick a star rating first.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/reviews", { hotelId, rating, comment });
      setRating(0);
      setComment("");
      load();
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      load();
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the review.");
    }
  };

  return (
    <div className="reviews">
      {loading && <p className="muted">Loading reviews…</p>}
      {!loading && reviews.length === 0 && (
        <p className="muted">No reviews yet — be the first after your stay.</p>
      )}

      {reviews.map((review) => (
        <article key={review._id} className="review-card">
          <div className="review-card-top">
            <strong>{review.user?.name || "Guest"}</strong>
            <Stars value={review.rating} />
          </div>
          <p className="muted review-date">{formatDate(review.createdAt)}</p>
          <p>{review.comment}</p>
          {user && (review.user?._id === user._id || user.role === "admin") && (
            <button
              type="button"
              className="review-delete"
              onClick={() => handleDelete(review._id)}
            >
              Delete
            </button>
          )}
        </article>
      ))}

      {user && !myReview && (
        <form className="review-form" onSubmit={handleSubmit}>
          <h3>Leave a review</h3>
          <p className="muted">Available after a completed stay at this hotel.</p>
          <div className="star-input" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-button ${star <= rating ? "filled" : ""}`}
                onClick={() => setRating(star)}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            rows="3"
            placeholder="How was your stay?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            required
          />
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </form>
      )}

      {!user && (
        <p className="muted">
          <Link to="/login">Log in</Link> to leave a review after your stay.
        </p>
      )}
    </div>
  );
}

export default Reviews;
