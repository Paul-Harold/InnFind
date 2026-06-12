import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { formatPrice } from "../../utils/format.js";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data.stats))
      .catch(() => setError("Could not load stats."));
  }, []);

  if (error) return <div className="form-error">{error}</div>;
  if (!stats) return <p className="muted">Loading…</p>;

  const cards = [
    { label: "Revenue", value: formatPrice(stats.revenue), accent: true },
    { label: "Bookings", value: stats.bookings },
    { label: "Hotels", value: stats.hotels },
    { label: "Rooms", value: stats.rooms },
    { label: "Users", value: stats.users },
    { label: "Reviews", value: stats.reviews },
  ];

  return (
    <div className="stat-grid">
      {cards.map(({ label, value, accent }) => (
        <div key={label} className={`stat-card ${accent ? "stat-accent" : ""}`}>
          <p className="stat-value">{value}</p>
          <p className="muted">{label}</p>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;
