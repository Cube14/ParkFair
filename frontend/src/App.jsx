import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* AUTH */

import Login from "./auth/pages/Login";
import Signup from "./auth/pages/Signup";
import ForgotPassword from "./auth/pages/ForgotPassword";

/* PROTECTED ROUTE */

import ProtectedRoute from "./components/ProtectedRoute";

/* ADMIN */

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import ParkingLayout from "./pages/ParkingLayout";
import Cycles from "./pages/Cycles";
import Flats from "./pages/Flats";
import Vehicles from "./pages/Vehicles";
import Assignments from "./pages/Assignments";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

/* RESIDENT */

import ResidentLayout from "./resident/layouts/ResidentLayout";

import ResidentDashboard from "./resident/pages/Dashboard";
import ParkingStatus from "./resident/pages/ParkingStatus";
import Schedule from "./resident/pages/Schedule";
import Notifications from "./resident/pages/Notifications";
import Profile from "./resident/pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ========================= */}
        {/* PUBLIC ROUTES */}
        {/* ========================= */}

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* ========================= */}
        {/* ADMIN ROUTES */}
        {/* ========================= */}

        <Route
          path="/"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/layout"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <ParkingLayout />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cycles"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Cycles />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/flats"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Flats />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Vehicles />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assignments"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Assignments />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Analytics />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* RESIDENT ROUTES */}
        {/* ========================= */}

        <Route
          path="/resident"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <ResidentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ResidentDashboard />} />

          <Route
            path="parking"
            element={<ParkingStatus />}
          />

          <Route
            path="schedule"
            element={<Schedule />}
          />

          <Route
            path="notifications"
            element={<Notifications />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />
        </Route>

        {/* ========================= */}
        {/* LEGACY ADMIN URL */}
        {/* ========================= */}

        <Route
          path="/admin"
          element={<Navigate to="/" replace />}
        />

        {/* ========================= */}
        {/* FALLBACK */}
        {/* ========================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;