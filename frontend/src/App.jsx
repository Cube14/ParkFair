import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import ParkingLayout from "./pages/ParkingLayout";

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

      </Routes>

    </BrowserRouter>
  );
}

export default App;