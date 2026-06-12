import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    photos: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    // Average of review ratings; recalculated when reviews change (Phase 5).
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    // Lowest pricePerNight among this hotel's rooms; kept in sync on room changes.
    cheapestPrice: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
