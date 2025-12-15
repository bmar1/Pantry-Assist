import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import LoadingScreen from "./pages/LoadingScreen";
import RecipePage from "./pages/RecipePage";
import GroceryListPage from "./pages/GroceryPage";
import LandingPage from "./pages/Landing";
import AllMeals from "./pages/AllMeals";
import About from "./pages/About";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (

      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/LoadingScreen"
            element={
              <ProtectedRoute>
                <LoadingScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipe"
            element={
              <ProtectedRoute>
                <RecipePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grocery"
            element={
              <ProtectedRoute>
                <GroceryListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-meals"
            element={
              <ProtectedRoute>
                <AllMeals />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    
  );
}

export default App;

