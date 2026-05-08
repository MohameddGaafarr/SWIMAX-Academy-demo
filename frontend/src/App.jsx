import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import CoachesPage from "./pages/CoachesPage.jsx";
import CoachProfilePage from "./pages/CoachProfilePage.jsx";
import SessionsPage from "./pages/SessionsPage.jsx";
import SessionDetailsPage from "./pages/SessionDetailsPage.jsx";
import TraineesPage from "./pages/TraineesPage.jsx";
import TraineeProfilePage from "./pages/TraineeProfilePage.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 overflow-x-hidden">
      
      {/* Background (fixed) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-1/4 top-0 h-[min(70vh,600px)] w-[min(70vw,700px)] rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="absolute -right-1/4 bottom-0 h-[min(60vh,500px)] w-[min(60vw,600px)] rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-400/5 blur-3xl" />
      </div>

      {/* App Content */}
      <div className="relative z-10 min-h-screen">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="coaches" element={<CoachesPage />} />
              <Route path="coaches/:id" element={<CoachProfilePage />} />
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="sessions/:id" element={<SessionDetailsPage />} />
              <Route path="trainees" element={<TraineesPage />} />
              <Route path="trainees/:id" element={<TraineeProfilePage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}