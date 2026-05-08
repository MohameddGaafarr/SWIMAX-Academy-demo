import { Router } from "express";
import {
  clearAllSessions,
  createSession,
  deleteSession,
  getAllSessions,
  getCurrentSession,
  getUpcomingSession,
  getSessionById,
  updateSession,
} from "../controllers/sessionController.js";

const router = Router();

router.post("/", createSession);
router.get("/", getAllSessions);
router.get("/current", getCurrentSession);
router.get("/upcoming", getUpcomingSession);
router.delete("/clear", clearAllSessions);
router.get("/:id", getSessionById);
router.put("/:id", updateSession);
router.delete("/:id", deleteSession);

export default router;
