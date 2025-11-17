import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Login"; // your login component
import LoadingScreen from "./LoadingScreen";
import RecipePage from "./recipePage";
import GroceryListPage from "./groceryPage";
import LandingPage from "./Landing";
import AllMeals from "./allMeals";
import { DarkModeProvider } from "./templates/DarkModeContext";

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
        </Routes>
      </Router>
    </DarkModeProvider>
  );
}

export default App;

