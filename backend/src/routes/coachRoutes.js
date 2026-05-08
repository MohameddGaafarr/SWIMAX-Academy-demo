import { Router } from "express";
import multer from "multer";
import fs from "fs";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import {
  createCoach,
  deleteCoach,
  getAllCoaches,
  getCoachById,
  updateCoach,
} from "../controllers/coachController.js";

const router = Router();

/* ================= 🔥 MULTER CONFIG ================= */

// 📁 folder (احتياطي لو احتجته)
const uploadDir = "uploads/coaches";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 📦 Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "swimax",
      allowed_formats: ["jpg", "png", "jpeg"],
    };
  },
});

// 🛑 images only (اختياري بس سيبه)
const fileFilter = (req, file, cb) => {
  if (!file) return cb(null, true);
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

/* ================= ROUTES ================= */

// ✅ create (image optional)
router.post("/", upload.single("image"), createCoach);

// ✅ update
router.put("/:id", upload.single("image"), updateCoach);

// GET
router.get("/", getAllCoaches);
router.get("/:id", getCoachById);

// DELETE
router.delete("/:id", deleteCoach);

export default router;