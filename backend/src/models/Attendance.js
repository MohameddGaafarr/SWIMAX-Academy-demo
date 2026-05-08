import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true, index: true },
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: "Coach", required: true },
    date: { type: String, required: true, trim: true, index: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 0 },
    durationHours: { type: Number, required: true, min: 0 },
    attended: { type: Boolean, required: true, default: true },
    note: { type: String, default: "", trim: true },
    reason: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

attendanceSchema.index({ sessionId: 1, date: 1, startTime: 1 }, { unique: true });
attendanceSchema.index({ coachId: 1, date: -1 });
attendanceSchema.index({ sessionId: 1, date: -1 });

export default mongoose.model("Attendance", attendanceSchema);
