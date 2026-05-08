import mongoose from "mongoose";

export const SESSION_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const scheduleEntrySchema = new mongoose.Schema(
  {
    day: { type: String, required: true, enum: SESSION_DAYS },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema(
  {
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: "Coach", required: true },
    trainees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trainee" }],
    schedule: {
      type: [scheduleEntrySchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one schedule slot is required",
      },
    },
    isAttended: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Session", sessionSchema);
