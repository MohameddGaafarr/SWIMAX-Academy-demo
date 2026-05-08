import mongoose from "mongoose";

export const TRAINEE_LEVELS = [
  "Underwater Skills",
  "Streamline Fundamentales",
  "Float & swim",
  "Stroke Basics",
  "Stroke Development",
  "Star 1&2 Training",
  "Kicks Training",
  "Coordination Training",
  "Star 3 Training",
  "Star 4 Training",
];

const traineeSchema = new mongoose.Schema(
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

    level: { type: String, required: true, enum: TRAINEE_LEVELS },

    notes: { type: String, default: "", trim: true },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },

    // 🖼️ Image URL (Cloudinary)
    image: {
      type: String,
      default: "",
    },

    // 🔥 مهم جدًا: public_id عشان نقدر نمسح الصورة
    imagePublicId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Trainee", traineeSchema);