import dotenv from "dotenv";
import dns from "dns";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const img = (id) =>
  `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;

const hotelsData = [
  {
    name: "Azure Bay Resort",
    city: "Boracay",
    address: "Station 1, White Beach, Boracay Island, Malay, Aklan",
    description:
      "Beachfront resort steps away from the powdery white sands of Station 1. Infinity pool, beach bar, and sunset views every evening.",
    photos: [img("photo-1571896349842-33c89424de2d"), img("photo-1584132967334-10e028bd69f7")],
    amenities: ["wifi", "pool", "beachfront", "restaurant", "spa", "breakfast"],
    featured: true,
    rooms: [
      { title: "Deluxe Garden Room", description: "Cozy 28sqm room overlooking the tropical garden, with a queen bed and rain shower.", pricePerNight: 4500, maxGuests: 2, photos: [img("photo-1582719508461-905c673771fd")], amenities: ["wifi", "aircon", "breakfast"] },
      { title: "Premier Sea View Room", description: "36sqm room with a private balcony facing White Beach. King bed, bathtub, and minibar.", pricePerNight: 7800, maxGuests: 2, photos: [img("photo-1611892440504-42a792e24d32")], amenities: ["wifi", "aircon", "balcony", "breakfast", "minibar"] },
      { title: "Family Suite", description: "Two-bedroom suite for up to 5 guests with a living area and kitchenette.", pricePerNight: 11500, maxGuests: 5, photos: [img("photo-1598928506311-c55ded91a20c")], amenities: ["wifi", "aircon", "kitchenette", "breakfast"] },
    ],
  },
  {
    name: "Manila Grand Central Hotel",
    city: "Manila",
    address: "Roxas Boulevard, Ermita, Manila",
    description:
      "City hotel on Roxas Boulevard with skyline views of Manila Bay. Walking distance to Intramuros and Rizal Park, with a rooftop pool and gym.",
    photos: [img("photo-1566073771259-6a8506099945"), img("photo-1551882547-ff40c63fe5fa")],
    amenities: ["wifi", "pool", "gym", "restaurant", "parking", "breakfast"],
    featured: true,
    rooms: [
      { title: "Superior Twin Room", description: "Smart 26sqm room with two single beds, work desk, and city views.", pricePerNight: 3200, maxGuests: 2, photos: [img("photo-1631049307264-da0ec9d70304")], amenities: ["wifi", "aircon", "workspace"] },
      { title: "Executive King Room", description: "32sqm room on the upper floors with bay views, king bed, and lounge access.", pricePerNight: 5400, maxGuests: 2, photos: [img("photo-1590490360182-c33d57733427")], amenities: ["wifi", "aircon", "workspace", "breakfast", "minibar"] },
      { title: "Bay View Suite", description: "55sqm corner suite with panoramic Manila Bay sunsets, separate living room, and bathtub.", pricePerNight: 9800, maxGuests: 3, photos: [img("photo-1578683010236-d716f9a3f461")], amenities: ["wifi", "aircon", "balcony", "breakfast", "minibar", "bathtub"] },
    ],
  },
  {
    name: "Cebu Marina Suites",
    city: "Cebu",
    address: "Cebu Business Park, Cebu City",
    description:
      "Modern suites in the heart of Cebu Business Park. Ideal for business and leisure, with fast Wi-Fi, a lap pool, and an all-day cafe.",
    photos: [img("photo-1542314831-068cd1dbfeeb"), img("photo-1564501049412-61c2a3083791")],
    amenities: ["wifi", "pool", "gym", "parking", "restaurant"],
    featured: true,
    rooms: [
      { title: "Studio Suite", description: "30sqm studio with queen bed, kitchenette, and washer — great for longer stays.", pricePerNight: 2900, maxGuests: 2, photos: [img("photo-1595576508898-0ad5c879a061")], amenities: ["wifi", "aircon", "kitchenette", "workspace"] },
      { title: "One-Bedroom Suite", description: "45sqm suite with separate bedroom, full kitchen, and dining area.", pricePerNight: 4600, maxGuests: 3, photos: [img("photo-1602002418082-a4443e081dd1")], amenities: ["wifi", "aircon", "kitchenette", "workspace", "minibar"] },
      { title: "Penthouse Suite", description: "Top-floor 80sqm suite with wraparound windows and skyline views of Cebu.", pricePerNight: 12000, maxGuests: 4, photos: [img("photo-1578683010236-d716f9a3f461")], amenities: ["wifi", "aircon", "kitchenette", "balcony", "minibar", "bathtub"] },
    ],
  },
  {
    name: "El Nido Cove Villas",
    city: "El Nido",
    address: "Corong-Corong Beach, El Nido, Palawan",
    description:
      "Boutique villas tucked into a quiet cove near Corong-Corong. Kayaks, island-hopping tours, and hammocks under the palms.",
    photos: [img("photo-1520250497591-112f2f40a3f4"), img("photo-1445019980597-93fa8acb246c")],
    amenities: ["wifi", "beachfront", "restaurant", "breakfast", "spa"],
    featured: true,
    rooms: [
      { title: "Native Cabana", description: "Charming nipa-style cabana with a double bed and outdoor shower, steps from the water.", pricePerNight: 3800, maxGuests: 2, photos: [img("photo-1582719508461-905c673771fd")], amenities: ["wifi", "breakfast"] },
      { title: "Beachfront Villa", description: "Private 40sqm villa with a deck opening straight onto the sand.", pricePerNight: 8900, maxGuests: 3, photos: [img("photo-1598928506311-c55ded91a20c")], amenities: ["wifi", "aircon", "balcony", "breakfast"] },
      { title: "Cliffside Pool Villa", description: "Villa with private plunge pool perched above the cove — best sunset in El Nido.", pricePerNight: 14500, maxGuests: 2, photos: [img("photo-1571896349842-33c89424de2d")], amenities: ["wifi", "aircon", "pool", "balcony", "breakfast", "minibar"] },
    ],
  },
  {
    name: "Baguio Pinewood Lodge",
    city: "Baguio",
    address: "Session Road, Baguio City, Benguet",
    description:
      "Cabin-style lodge among the pines, minutes from Session Road. Fireplaces, thick blankets, and hot taho mornings in the City of Pines.",
    photos: [img("photo-1551882547-ff40c63fe5fa"), img("photo-1566073771259-6a8506099945")],
    amenities: ["wifi", "parking", "restaurant", "breakfast"],
    featured: false,
    rooms: [
      { title: "Pine View Room", description: "Warm 24sqm room with queen bed and a window seat looking into the pine forest.", pricePerNight: 2400, maxGuests: 2, photos: [img("photo-1631049307264-da0ec9d70304")], amenities: ["wifi", "breakfast"] },
      { title: "Fireplace Cabin", description: "Standalone cabin with a working fireplace, loft bed, and porch.", pricePerNight: 4200, maxGuests: 4, photos: [img("photo-1578683010236-d716f9a3f461")], amenities: ["wifi", "fireplace", "breakfast", "parking"] },
      { title: "Family Loft", description: "Two-level loft sleeping six, with a full kitchen and board games.", pricePerNight: 5800, maxGuests: 6, photos: [img("photo-1598928506311-c55ded91a20c")], amenities: ["wifi", "kitchenette", "breakfast", "parking"] },
    ],
  },
  {
    name: "Siargao Cloud 9 Surf House",
    city: "Siargao",
    address: "Cloud 9 Boardwalk, General Luna, Siargao",
    description:
      "Laid-back surf house a short walk from the Cloud 9 boardwalk. Board rentals, surf lessons, and smoothie bowls at the in-house cafe.",
    photos: [img("photo-1445019980597-93fa8acb246c"), img("photo-1520250497591-112f2f40a3f4")],
    amenities: ["wifi", "beachfront", "restaurant", "breakfast"],
    featured: false,
    rooms: [
      { title: "Surfer Bunk Room", description: "Private 4-bunk room for barkadas — includes board racks and lockers.", pricePerNight: 1800, maxGuests: 4, photos: [img("photo-1595576508898-0ad5c879a061")], amenities: ["wifi", "aircon"] },
      { title: "Garden Double", description: "Simple, breezy double room wrapped in tropical greenery.", pricePerNight: 2600, maxGuests: 2, photos: [img("photo-1582719508461-905c673771fd")], amenities: ["wifi", "aircon", "breakfast"] },
      { title: "Ocean Deck Room", description: "Upstairs room with a private deck and views over the reef break.", pricePerNight: 4400, maxGuests: 2, photos: [img("photo-1611892440504-42a792e24d32")], amenities: ["wifi", "aircon", "balcony", "breakfast"] },
    ],
  },
  {
    name: "Tagaytay Ridge Hotel",
    city: "Tagaytay",
    address: "Aguinaldo Highway, Tagaytay City, Cavite",
    description:
      "Ridge-side hotel with sweeping views of Taal Lake and Volcano. Cool breeze, bulalo at the veranda restaurant, and an infinity-edge pool.",
    photos: [img("photo-1566073771259-6a8506099945"), img("photo-1542314831-068cd1dbfeeb")],
    amenities: ["wifi", "pool", "parking", "restaurant", "breakfast", "spa"],
    featured: false,
    rooms: [
      { title: "Standard Lake Room", description: "26sqm room with a picture window framing Taal Lake.", pricePerNight: 3000, maxGuests: 2, photos: [img("photo-1590490360182-c33d57733427")], amenities: ["wifi", "aircon", "breakfast"] },
      { title: "Veranda Suite", description: "Suite with a wide private veranda — coffee with the best view in Tagaytay.", pricePerNight: 6200, maxGuests: 3, photos: [img("photo-1602002418082-a4443e081dd1")], amenities: ["wifi", "aircon", "balcony", "breakfast", "minibar"] },
      { title: "Family Lake House", description: "Detached two-bedroom house with garden access and a grill area.", pricePerNight: 9500, maxGuests: 6, photos: [img("photo-1598928506311-c55ded91a20c")], amenities: ["wifi", "aircon", "kitchenette", "parking", "breakfast"] },
    ],
  },
  {
    name: "Davao Riverfront Inn",
    city: "Davao",
    address: "Torres Street, Poblacion District, Davao City",
    description:
      "Friendly boutique inn near Davao's food strip. Durian candy at the front desk, river views from the roof deck, and big breakfasts.",
    photos: [img("photo-1564501049412-61c2a3083791"), img("photo-1551882547-ff40c63fe5fa")],
    amenities: ["wifi", "parking", "restaurant", "breakfast"],
    featured: false,
    rooms: [
      { title: "Cozy Queen Room", description: "Compact 20sqm room with queen bed and blackout curtains.", pricePerNight: 1900, maxGuests: 2, photos: [img("photo-1631049307264-da0ec9d70304")], amenities: ["wifi", "aircon"] },
      { title: "Twin Deluxe", description: "Bright 26sqm twin room, ideal for friends on a city food crawl.", pricePerNight: 2500, maxGuests: 2, photos: [img("photo-1595576508898-0ad5c879a061")], amenities: ["wifi", "aircon", "breakfast"] },
      { title: "Riverview Family Room", description: "34sqm room with one queen and one bunk bed, overlooking the river.", pricePerNight: 3600, maxGuests: 4, photos: [img("photo-1578683010236-d716f9a3f461")], amenities: ["wifi", "aircon", "breakfast", "parking"] },
    ],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected. Seeding…");

    // Bookings and reviews reference rooms/hotels, so reseeding clears them too.
    await Hotel.deleteMany();
    await Room.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();

    // Demo accounts (created only if missing so reseeding keeps logins stable).
    const accounts = [
      { name: "Admin", email: "admin@innfind.com", password: "admin123", role: "admin" },
      { name: "Demo User", email: "demo@innfind.com", password: "demo123", role: "user" },
    ];
    for (const account of accounts) {
      const exists = await User.findOne({ email: account.email });
      if (!exists) await User.create(account);
    }

    let totalRooms = 0;
    const createdHotels = [];
    for (const { rooms, ...hotelFields } of hotelsData) {
      const cheapestPrice = Math.min(...rooms.map((r) => r.pricePerNight));
      const hotel = await Hotel.create({ ...hotelFields, cheapestPrice });
      await Room.insertMany(rooms.map((room) => ({ ...room, hotel: hotel._id })));
      createdHotels.push(hotel);
      totalRooms += rooms.length;
    }

    // Reviewer accounts + reviews so listings show real ratings.
    const reviewerData = [
      { name: "Maria Santos", email: "maria@example.com", password: "password123" },
      { name: "Juan dela Cruz", email: "juan@example.com", password: "password123" },
      { name: "Aiko Reyes", email: "aiko@example.com", password: "password123" },
    ];
    const reviewers = [];
    for (const data of reviewerData) {
      let reviewer = await User.findOne({ email: data.email });
      if (!reviewer) reviewer = await User.create(data);
      reviewers.push(reviewer);
    }

    // [hotelIndex, reviewerIndex, rating, comment]
    const reviewSpecs = [
      [0, 0, 5, "Woke up to White Beach every morning. Staff remembered our names — felt like family."],
      [0, 1, 4, "Beautiful resort and great breakfast spread. Pool gets busy by mid-afternoon."],
      [1, 0, 4, "Perfect location for exploring Intramuros. The bay view from the suite is worth it."],
      [1, 2, 5, "Rooftop pool at sunset with the Manila Bay skyline — unbeatable for the price."],
      [2, 1, 4, "Spotless suite with a real kitchen. Walking distance to Ayala Center."],
      [2, 2, 4, "Fast Wi-Fi and a proper work desk. My go-to for Cebu business trips."],
      [3, 0, 5, "The cliffside villa is pure magic. Island hopping tour booked by the front desk was excellent."],
      [3, 1, 5, "Quietest cove in El Nido. Kayaks free for guests — paddle out before breakfast."],
      [4, 2, 4, "Cozy fireplace cabin, smelled like pine all weekend. Bring a jacket!"],
      [5, 0, 4, "Steps from Cloud 9. Board rental was hassle-free and the smoothie bowls slap."],
      [6, 1, 5, "That veranda view of Taal... we extended a night just to keep it."],
      [7, 2, 4, "Friendly staff and huge breakfasts. Great base for a Davao food crawl."],
    ];
    for (const [hotelIdx, reviewerIdx, rating, comment] of reviewSpecs) {
      await Review.create({
        user: reviewers[reviewerIdx]._id,
        hotel: createdHotels[hotelIdx]._id,
        rating,
        comment,
      });
    }
    for (const hotel of createdHotels) {
      await Review.recalcHotelRating(hotel._id);
    }

    console.log(
      `Seeded ${hotelsData.length} hotels, ${totalRooms} rooms, ${reviewSpecs.length} reviews.`
    );
    console.log("Demo accounts: admin@innfind.com/admin123, demo@innfind.com/demo123");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
