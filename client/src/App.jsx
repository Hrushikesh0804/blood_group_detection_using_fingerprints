import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Predict from "./pages/Predict";
import History from "./pages/History";

import Navbar from "./components/Navbar";

// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  console.log("ProtectedRoute token:", token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route path="/signup" element={<Signup />} />

        <Route path="/login" element={<Login />} />

        {/* =================================================
            PROTECTED PREDICTION ROUTE
        ================================================= */}

        <Route
          path="/predict"
          element={
            <ProtectedRoute>
              <Predict />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PROTECTED HISTORY ROUTE
        ================================================= */}

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            DEFAULT ROUTE
        ================================================= */}

        <Route path="/" element={<Navigate to="/predict" replace />} />

        {/* =================================================
            UNKNOWN ROUTES
        ================================================= */}

        <Route path="*" element={<Navigate to="/predict" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
