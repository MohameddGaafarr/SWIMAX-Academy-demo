import mongoose from "mongoose";

const coachSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    age: { type: Number, required: true, min: 0 },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9+\-() ]{7,20}$/, "Phone number format is invalid"],
    },

    address: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Address must be at least 3 characters"],
    },

    bio: { type: String, default: "", trim: true },

    totalWorkingHours: { type: Number, default: 0, min: 0 },

    // 🖼️ Image URL (Cloudinary)
    image: {
      type: String,
      default: "",
    },

    // 🔥 public_id عشان نقدر نمسح الصورة
    imagePublicId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Coach", coachSchema);