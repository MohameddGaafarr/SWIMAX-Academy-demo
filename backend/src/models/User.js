import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // ✅ بدل bcrypt

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 1,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * 🔐 Hash password before save
 */
userSchema.pre("save", async function () {
  try {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    console.error("💥 HASH ERROR:", err);
    throw err;
  }
});

/**
 * 🔍 Compare password
 */
userSchema.methods.comparePassword = async function (candidate) {
  try {
    return await bcrypt.compare(candidate, this.password);
  } catch (err) {
    console.error("💥 COMPARE ERROR:", err);
    throw err;
  }
};

export default mongoose.model("User", userSchema);