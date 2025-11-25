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

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/LoadingScreen" element={<LoadingScreen />} />
          <Route path="/recipe" element={<RecipePage />} />
          <Route path="/grocery" element={<GroceryListPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/all-meals" element={<AllMeals />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
}

export default App;

