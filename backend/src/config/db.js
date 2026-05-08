import mongoose from "mongoose";

export async function connectDB() {
  try {
    const uri = String(process.env.MONGODB_URI ?? "").trim();

    if (!uri) {
      throw new Error("MONGODB_URI is not set");
    }

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    return conn.connection;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    if (process.env.NODE_ENV === "production") {
      console.error(
        "Check Railway env var MONGODB_URI, Atlas Network Access (allow 0.0.0.0/0), and DB user credentials.",
      );
    }
    process.exit(1);
  }
}