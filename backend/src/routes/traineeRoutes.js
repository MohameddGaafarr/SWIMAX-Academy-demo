import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

import {
  createTrainee,
  deleteTrainee,
  getAllTrainees,
  getTraineeById,
  updateTrainee,
} from "../controllers/traineeController.js";

const router = Router();

/* ================= 🔥 MULTER CONFIG ================= */

// 📁 فولدر الصور
const uploadDir = "uploads/trainees";

// نتأكد إنه موجود
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ⚙️ storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "swimax",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// 🎯 images only
const fileFilter = (req, file, cb) => {
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

// 🔥 create (image optional)
router.post("/", upload.single("image"), createTrainee);

// 🔥 update (image optional)
router.put("/:id", upload.single("image"), updateTrainee);

router.get("/", getAllTrainees);
router.get("/:id", getTraineeById);
router.delete("/:id", deleteTrainee);

export default router;