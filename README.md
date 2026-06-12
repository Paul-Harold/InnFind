# InnFind — Hotel Reservation App

A full-stack hotel reservation platform built as a portfolio project. Browse hotels across the Philippines, book a room, manage your stays, and leave reviews — all backed by a REST API with JWT authentication.

**Live demo:** _add your Vercel URL here_  
**API:** _add your Render URL here_

---

## Features

| Area | What it does |
|---|---|
| **Browse** | Search by destination, filter by price, amenities, and rating |
| **Room detail** | Photo gallery, amenities, live availability check, price calculator |
| **Booking** | Date-overlap validation, server-side pricing, printable receipt |
| **Dashboard** | Upcoming / past / cancelled tabs, cancel stays |
| **Reviews** | Star ratings, gated to completed stays, live hotel rating recalc |
| **Admin** | Stats overview, hotel/room CRUD, booking status management |
| **Auth** | JWT with 30-day tokens, session restored on page load |

---

## Demo credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@innfind.com | admin123 |
| User | demo@innfind.com | demo123 |

---

## Tech stack

**Frontend** — React 19, Vite, React Router v7, Axios  
**Backend** — Node.js, Express, Mongoose  
**Database** — MongoDB (local dev) / MongoDB Atlas (production)  
**Auth** — JWT (jsonwebtoken), bcryptjs  
**Deploy** — Vercel (client), Render (server), MongoDB Atlas (DB)

---

## Local development

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd <repo-folder>

npm install --prefix server
npm install --prefix client
```

### 2. Configure environment

```bash
# server/.env  (copy from server/.env.example)
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hotel-reservation
JWT_SECRET=<64-char random string>
CLIENT_URL=http://localhost:5173

# client/.env  (copy from client/.env.example)
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the database

```bash
npm run seed --prefix server
```

Seeds 8 hotels, 24 rooms, 12 reviews, and the demo accounts above.

### 4. Start both servers

```bash
# Terminal 1
npm run dev --prefix server    # http://localhost:5000

# Terminal 2
npm run dev --prefix client    # http://localhost:5173
```

---

## Production deployment

### MongoDB Atlas (database)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Database Access** → create a user with Read/Write
3. **Network Access** → add `0.0.0.0/0` (allow all, or restrict to Render IPs)
4. **Connect** → copy the connection string (replace `<password>`)
5. Run the seed script once against Atlas:
   ```bash
   MONGO_URI="mongodb+srv://..." node server/seed/seed.js
   ```

### Render (API server)

1. New → **Web Service** → connect your GitHub repo
2. **Root directory:** `server`
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. **Environment variables:**

| Key | Value |
|---|---|
| `MONGO_URI` | Atlas connection string |
| `JWT_SECRET` | 64-char random string |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `NODE_ENV` | `production` |

6. Deploy — note the `https://your-api.onrender.com` URL for the next step.

> **Note:** Free Render instances spin down after 15 min of inactivity. The first request after a cold start takes ~30 seconds.

### Vercel (React client)

1. New Project → import your GitHub repo
2. **Root directory:** `client`
3. **Framework preset:** Vite (auto-detected)
4. **Environment variables:**

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-api.onrender.com/api` |

5. Deploy — the `vercel.json` in `client/` handles SPA routing automatically.

---

## Project structure

```
├── client/
│   ├── src/
│   │   ├── api/          # Axios instance with JWT interceptor
│   │   ├── components/   # Navbar, SearchBar, RoomCard, FilterSidebar, Reviews, …
│   │   ├── context/      # AuthContext
│   │   ├── hooks/        # useAuth
│   │   ├── pages/        # Home, Rooms, RoomDetail, Login, Signup,
│   │   │                 # Dashboard, BookingConfirmation, NotFound
│   │   │   └── admin/    # AdminLayout, AdminDashboard, ManageHotels,
│   │   │                 # ManageRooms, ManageBookings
│   │   └── utils/        # formatPrice, formatDate, nightsBetween
│   └── vercel.json
└── server/
    ├── config/           # MongoDB connection
    ├── controllers/      # auth, hotel, room, booking, review, admin
    ├── middleware/        # protect (JWT), admin (role), errorHandler
    ├── models/           # User, Hotel, Room, Booking, Review
    ├── routes/           # /api/auth /hotels /rooms /bookings /reviews /admin
    └── seed/             # seed.js — demo data
```

---

## API reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | user | Current user |
| GET | `/api/hotels` | — | List with filters |
| GET | `/api/hotels/:id` | — | Hotel + rooms |
| GET | `/api/rooms` | — | List with filters |
| GET | `/api/rooms/:id` | — | Room detail |
| GET | `/api/rooms/availability/:id` | — | Check date availability |
| POST | `/api/bookings` | user | Create booking |
| GET | `/api/bookings/my` | user | My bookings |
| GET | `/api/bookings/:id` | owner/admin | Booking detail |
| PUT | `/api/bookings/:id/cancel` | owner | Cancel booking |
| POST | `/api/reviews` | user (completed stay) | Submit review |
| GET | `/api/reviews/hotel/:id` | — | Hotel's reviews |
| DELETE | `/api/reviews/:id` | owner/admin | Delete review |
| GET | `/api/admin/stats` | admin | Site statistics |
| POST/PUT/DELETE | `/api/hotels` | admin | Hotel CRUD |
| POST/PUT/DELETE | `/api/rooms` | admin | Room CRUD |
| GET | `/api/bookings` | admin | All bookings |
| PUT | `/api/bookings/:id/status` | admin | Change status |

---

## License

MIT
