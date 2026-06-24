import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import ParkingLayout from "./pages/ParkingLayout";
import Cycles from "./pages/Cycles";
import Flats from "./pages/Flats";
import Vehicles from "./pages/Vehicles";
import Assignments from "./pages/Assignments";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />

        <Route
          path="/layout"
          element={
            <MainLayout>
              <ParkingLayout />
            </MainLayout>
          }
        />

        <Route
          path="/cycles"
          element={
            <MainLayout>
              <Cycles />
            </MainLayout>
          }
        />

        <Route
          path="/flats"
          element={
            <MainLayout>
              <Flats />
            </MainLayout>
          }
        />

        <Route
          path="/vehicles"
          element={
            <MainLayout>
              <Vehicles />
            </MainLayout>
          }
        />

        <Route
          path="/assignments"
          element={
            <MainLayout>
              <Assignments />
            </MainLayout>
          }
        />

        <Route
        path="/analytics"
        element={
        <MainLayout>
          <Analytics />
         </MainLayout>
         }
        />
         <Route
          path="/settings"
          element={
            < MainLayout>
          <Settings />
        </MainLayout>
         }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;