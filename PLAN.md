# Hotel Reservation App — Implementation Plan

Portfolio-ready fullstack hotel reservation platform.
**Stack:** React (Vite) · Node.js/Express · MongoDB (Mongoose) · JWT auth · No payment processing (booking generates a basic receipt).

---

## 1. Project Structure

```
hotel-reservation/
├── client/                  # React (Vite)
│   ├── src/
│   │   ├── api/             # Axios instance + API call modules
│   │   ├── components/      # Navbar, Footer, SearchBar, RoomCard, FilterSidebar,
│   │   │                    # ReviewList, ReviewForm, BookingCard, ProtectedRoute, etc.
│   │   ├── context/         # AuthContext (user + token state)
│   │   ├── hooks/           # useAuth, useFetch
│   │   ├── pages/
│   │   │   ├── Home.jsx             # hero + search bar (location, dates, guests)
│   │   │   ├── Rooms.jsx            # listings + filters (price, amenities, rating)
│   │   │   ├── RoomDetail.jsx       # gallery, amenities, reviews, book CTA
│   │   │   ├── Login.jsx / Signup.jsx
│   │   │   ├── BookingConfirmation.jsx  # receipt view (printable)
│   │   │   ├── Dashboard.jsx        # my bookings (upcoming / past / cancelled)
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx   # stats overview
│   │   │       ├── ManageHotels.jsx
│   │   │       ├── ManageRooms.jsx
│   │   │       └── ManageBookings.jsx
│   │   ├── App.jsx          # routes
│   │   └── main.jsx
│   └── .env                 # VITE_API_URL
└── server/
    ├── config/db.js         # mongoose connection
    ├── models/              # User, Hotel, Room, Booking, Review
    ├── controllers/         # authController, hotelController, roomController,
    │                        # bookingController, reviewController
    ├── routes/              # /api/auth, /api/hotels, /api/rooms, /api/bookings, /api/reviews
    ├── middleware/          # auth (verify JWT), admin (role check), errorHandler
    ├── seed/seed.js         # demo data: hotels, rooms, users, reviews
    ├── server.js
    └── .env                 # PORT, MONGO_URI, JWT_SECRET
```

---

## 2. Database Models (Mongoose)

**User**
- name, email (unique), password (bcrypt-hashed)
- role: `"user" | "admin"` (default `"user"`)

**Hotel**
- name, city, address, description, photos[], rating (avg, computed from reviews)
- amenities[] (wifi, pool, parking, gym, breakfast…)
- featured (bool, for homepage)

**Room**
- hotel (ref Hotel), title, description, pricePerNight, maxGuests
- photos[], amenities[], roomNumbers[] (or just quantity for simplicity)

**Booking**
- user (ref), room (ref), hotel (ref)
- checkIn, checkOut, guests, totalPrice
- status: `"confirmed" | "cancelled" | "completed"`
- receiptNumber (generated, e.g. `RCP-2026-000123`)

**Review**
- user (ref), hotel (ref), rating (1–5), comment
- one review per user per hotel; hotel avg rating recalculated on save/delete

---

## 3. REST API

**Auth** (`/api/auth`)
- `POST /register` — create user, return JWT
- `POST /login` — verify, return JWT
- `GET /me` — current user (protected)

**Hotels** (`/api/hotels`)
- `GET /` — list, query params: `city`, `minPrice`, `maxPrice`, `amenities`, `rating`, `featured`
- `GET /:id` — detail incl. rooms
- `POST / PUT /:id / DELETE /:id` — admin only

**Rooms** (`/api/rooms`)
- `GET /:id` — room detail
- `GET /availability/:id?checkIn=&checkOut=` — availability check
- `POST / PUT /:id / DELETE /:id` — admin only

**Bookings** (`/api/bookings`)
- `POST /` — create (validates no date overlap for the room), returns booking + receipt data
- `GET /my` — current user's bookings
- `PUT /:id/cancel` — cancel own booking
- `GET / ` — all bookings (admin)

**Reviews** (`/api/reviews`)
- `POST /` — create (only if user has a completed booking at that hotel)
- `GET /hotel/:hotelId` — list for a hotel
- `DELETE /:id` — own review or admin

**Key business logic**
- Availability = no confirmed booking for that room where date ranges overlap.
- `totalPrice = nights × pricePerNight` computed server-side (never trust client).
- Receipt = booking confirmation page with receipt number, dates, price breakdown — printable via CSS, no payment involved.

---

## 4. Frontend Pages & Flow

1. **Home** — hero image, search bar (city, check-in/out date pickers, guest count) → navigates to `/rooms?city=…&checkIn=…`; featured hotels grid below.
2. **Rooms (listings)** — reads query params, sidebar filters (price slider, amenities checkboxes, min rating), room/hotel cards with photo, price/night, rating badge.
3. **Room detail** — photo gallery, description, amenities icons, date+guest picker with live price calc, "Reserve" button (redirects to login if unauthenticated), reviews section with submit form.
4. **Auth** — login/signup forms, JWT stored in localStorage, AuthContext exposes `user`, `login()`, `logout()`; axios interceptor attaches `Authorization: Bearer`.
5. **Booking confirmation** — success state with receipt (number, hotel, room, dates, nights × rate = total), print button.
6. **User dashboard** — tabs for upcoming/past/cancelled bookings, cancel action, "leave a review" on completed stays.
7. **Admin dashboard** — guarded by role; stats cards (total bookings, revenue, occupancy), CRUD tables for hotels/rooms, bookings list with status management.

---

## 5. Build Order (phases)

**Phase 1 — Scaffolding**
- Vite React app + Express server, MongoDB connection, env files, CORS, folder structure.

**Phase 2 — Auth**
- User model, register/login endpoints, JWT middleware, frontend auth pages + context + protected routes.

**Phase 3 — Hotels & Rooms (read path)**
- Models, seed script with realistic demo data (8–10 hotels, ~30 rooms, photos from Unsplash URLs), public list/detail endpoints, Home + Rooms + RoomDetail pages with search/filters.

**Phase 4 — Bookings**
- Booking model, availability/overlap logic, create/cancel endpoints, confirmation page with receipt, user dashboard.

**Phase 5 — Reviews**
- Review model + endpoints, review UI on room detail, avg rating recalculation.

**Phase 6 — Admin**
- Role middleware, admin pages (hotel/room CRUD, bookings table, stats).

**Phase 7 — Portfolio polish**
- Responsive design pass, loading skeletons, empty states, toast notifications.
- README with screenshots, feature list, setup instructions, demo credentials (user + admin).
- Deploy: client → Vercel/Netlify, server → Render, DB → MongoDB Atlas free tier.

---

## 6. Portfolio Extras (nice-to-have, after MVP)

- Dark mode toggle
- Map view of hotels (Leaflet, free)
- Image upload for admin (Cloudinary free tier)
- Basic rate limiting + helmet on the API (shows security awareness)
