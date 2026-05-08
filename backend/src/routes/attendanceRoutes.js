import { Router } from "express";
import {
  clearAllAttendance,
  getAllAttendance,
  getAttendanceByDate,
  getAttendanceBySession,
  getCoachPayrollSummary,
  markAttendance,
} from "../controllers/attendanceController.js";

const router = Router();

router.get("/history", getAllAttendance);
router.get("/payroll-summary", getCoachPayrollSummary);
router.get("/by-session-summary", getAttendanceBySession);
router.delete("/clear", clearAllAttendance);
router.post("/", markAttendance);
router.get("/", getAttendanceByDate);

export default router;
