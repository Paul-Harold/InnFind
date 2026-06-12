import { NavLink, Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <main className="page">
      <h1>Admin</h1>
      <nav className="admin-nav">
        <NavLink to="/admin" end>
          Overview
        </NavLink>
        <NavLink to="/admin/hotels">Hotels</NavLink>
        <NavLink to="/admin/rooms">Rooms</NavLink>
        <NavLink to="/admin/bookings">Bookings</NavLink>
      </nav>
      <Outlet />
    </main>
  );
}

export default AdminLayout;
