import mongoose from "mongoose";
import "../models/Session.js";
import Trainee, { TRAINEE_LEVELS } from "../models/Trainee.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import cloudinary from "../config/cloudinary.js";

const ALLOWED_SORT_FIELDS = ["name", "age", "level", "createdAt"];
const MAX_PAGE_SIZE = 100;
const PHONE_REGEX = /^[0-9+\-() ]{7,20}$/;

const populateSession = { path: "sessionId", select: "schedule" };

function invalidIdResponse(res) {
  return res.status(400).json({ message: "Invalid trainee id" });
}

function parseTraineePayload(body) {
  const { name, age, level, phone, address } = body ?? {};

  if (!name || String(name).trim() === "") {
    return { error: "Name is required" };
  }

  if (age === undefined || age === null || age === "") {
    return { error: "Age is required" };
  }

  const ageNum = Number(age);
  if (!Number.isFinite(ageNum) || ageNum < 0) {
    return { error: "Age must be a valid non-negative number" };
  }

  const levelStr = String(level);
  if (!TRAINEE_LEVELS.includes(levelStr)) {
    return { error: `Level must be one of: ${TRAINEE_LEVELS.join(", ")}` };
  }

  if (!phone || String(phone).trim() === "") {
    return { error: "Phone is required" };
  }
  const phoneStr = String(phone).trim();
  if (!PHONE_REGEX.test(phoneStr)) {
    return { error: "Phone must match format /^[0-9+\\-() ]{7,20}$/" };
  }

  if (!address || String(address).trim() === "") {
    return { error: "Address is required" };
  }
  const addressStr = String(address).trim();
  if (addressStr.length < 3) {
    return { error: "Address must be at least 3 characters" };
  }

  const data = {
    name: String(name).trim(),
    age: ageNum,
    level: levelStr,
    phone: phoneStr,
    address: addressStr,
  };

  if ("notes" in body) {
    data.notes = body.notes ? String(body.notes) : "";
  }

  if ("sessionId" in body) {
    const raw = body.sessionId;
    if (!raw) {
      data.sessionId = null;
    } else if (!mongoose.Types.ObjectId.isValid(String(raw))) {
      return { error: "Invalid session id" };
    } else {
      data.sessionId = new mongoose.Types.ObjectId(String(raw));
    }
  }

  return { data };
}

/* ================= CREATE ================= */

export async function createTrainee(req, res, next) {
  try {
    const parsed = parseTraineePayload(req.body);

    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    // 🔥 صورة (Cloudinary)
    if (req.file) {
      parsed.data.image = req.file.path;
      parsed.data.imagePublicId = req.file.filename;
    }

    const trainee = await Trainee.create(parsed.data);

    const populated = await Trainee.findById(trainee._id)
      .populate(populateSession)
      .lean();

    return res.status(201).json(populated);
  } catch (err) {
    return next(err);
  }
}

/* ================= GET ALL ================= */

export async function getAllTrainees(req, res, next) {
  try {
    const { search, sortBy, order, level } = req.query;

    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.min(MAX_PAGE_SIZE, parseInt(req.query.limit || "10"));

    const filter = {};

    if (search) {
      filter.name = {
        $regex: escapeRegex(search),
        $options: "i",
      };
    }

    if (level && TRAINEE_LEVELS.includes(String(level))) {
      filter.level = String(level);
    }

    const sortField = ALLOWED_SORT_FIELDS.includes(sortBy)
      ? sortBy
      : "createdAt";

    const sortOrder = order === "asc" ? 1 : -1;

    const totalItems = await Trainee.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    const trainees = await Trainee.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(populateSession)
      .lean();

    return res.json({
      trainees,
      currentPage: page,
      totalPages,
      totalItems,
    });
  } catch (err) {
    return next(err);
  }
}

/* ================= GET BY ID ================= */

export async function getTraineeById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return invalidIdResponse(res);
    }

    const trainee = await Trainee.findById(id)
      .populate(populateSession)
      .lean();

    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found" });
    }

    return res.json(trainee);
  } catch (err) {
    return next(err);
  }
}

/* ================= UPDATE ================= */

export async function updateTrainee(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return invalidIdResponse(res);
    }

    const parsed = parseTraineePayload(req.body);

    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const trainee = await Trainee.findById(id);

    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found" });
    }

    // ✏️ تحديث البيانات
    Object.assign(trainee, parsed.data);

    // 🔥 لو في صورة جديدة
    if (req.file) {
      // امسح القديمة
      if (trainee.imagePublicId) {
        await cloudinary.uploader.destroy(trainee.imagePublicId);
      }

      // خزّن الجديدة
      trainee.image = req.file.path;
      trainee.imagePublicId = req.file.filename;
    }

    await trainee.save();

    const populated = await Trainee.findById(id)
      .populate(populateSession)
      .lean();

    return res.json(populated);
  } catch (err) {
    return next(err);
  }
}

/* ================= DELETE ================= */

export async function deleteTrainee(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return invalidIdResponse(res);
    }

    const trainee = await Trainee.findById(id);

    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found" });
    }

    // 🔥 امسح الصورة من Cloudinary
    if (trainee.imagePublicId) {
      await cloudinary.uploader.destroy(trainee.imagePublicId);
    }

    await trainee.deleteOne();

    return res.json({
      message: "Trainee deleted",
      id: trainee._id,
    });
  } catch (err) {
    return next(err);
  }
}