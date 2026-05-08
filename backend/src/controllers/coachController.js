import cloudinary from "../config/cloudinary.js";
import Coach from "../models/Coach.js";
import { escapeRegex } from "../utils/escapeRegex.js";

const PHONE_REGEX = /^[0-9+\-() ]{7,20}$/;
const ALLOWED_SORT_FIELDS = [
  "name",
  "age",
  "phone",
  "address",
  "totalWorkingHours",
  "createdAt",
];
const MAX_PAGE_SIZE = 100;

function parseCoachPayload(body = {}) {
  const { name, age, phone, address, bio } = body;

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

  if (!phone || String(phone).trim() === "") {
    return { error: "Phone is required" };
  }

  const phoneStr = String(phone).trim();
  if (!PHONE_REGEX.test(phoneStr)) {
    return { error: "Phone format is invalid" };
  }

  if (!address || String(address).trim() === "") {
    return { error: "Address is required" };
  }

  const addressStr = String(address).trim();
  if (addressStr.length < 3) {
    return { error: "Address must be at least 3 characters" };
  }

  return {
    data: {
      name: String(name).trim(),
      age: ageNum,
      phone: phoneStr,
      address: addressStr,
      bio: bio ? String(bio) : "",
    },
  };
}

/**
 * 🟢 Create Coach
 */
export async function createCoach(req, res, next) {
  try {
    const parsed = parseCoachPayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const data = parsed.data;

    if (req.file) {
      data.image = req.file.path;
      data.imagePublicId = req.file.filename;
    }

    const coach = await Coach.create(data);

    res.status(201).json(coach);
  } catch (err) {
    next(err);
  }
}

/**
 * 🟢 Get All Coaches
 */
export async function getAllCoaches(req, res, next) {
  try {
    const { search, sortBy, order } = req.query;
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(MAX_PAGE_SIZE, parseInt(req.query.limit || "10", 10));

    const filter = {};
    if (search && String(search).trim()) {
      const rx = { $regex: escapeRegex(String(search).trim()), $options: "i" };
      filter.$or = [{ name: rx }, { phone: rx }, { address: rx }];
    }

    const sortField = ALLOWED_SORT_FIELDS.includes(sortBy)
      ? sortBy
      : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const totalItems = await Coach.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    const coaches = await Coach.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      coaches,
      totalItems,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 🟢 Get Coach By ID
 */
export async function getCoachById(req, res, next) {
  try {
    const coach = await Coach.findById(req.params.id);

    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    res.json(coach);
  } catch (err) {
    next(err);
  }
}

/**
 * 🟢 Update Coach
 */
export async function updateCoach(req, res, next) {
  try {
    const parsed = parseCoachPayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const coach = await Coach.findById(req.params.id);

    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    Object.assign(coach, parsed.data);

    if (req.file) {
      if (coach.imagePublicId) {
        await cloudinary.uploader.destroy(coach.imagePublicId);
      }

      coach.image = req.file.path;
      coach.imagePublicId = req.file.filename;
    }

    await coach.save();

    res.json(coach);
  } catch (err) {
    next(err);
  }
}

/**
 * 🟢 Delete Coach
 */
export async function deleteCoach(req, res, next) {
  try {
    const coach = await Coach.findById(req.params.id);

    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    if (coach.imagePublicId) {
      await cloudinary.uploader.destroy(coach.imagePublicId);
    }

    await coach.deleteOne();

    res.json({ message: "Coach deleted successfully" });
  } catch (err) {
    next(err);
  }
}