import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Login"; // your login component
import Onboarding from "./onboarding";
import LoadingScreen from "./LoadingScreen";
import RecipePage from "./recipePage";
import GroceryListPage from "./groceryPage";

function App() {
  return (
    <Router>
      {/* Defines routes and associated elements */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/LoadingScreen" element={<LoadingScreen />} />
        <Route path="/recipe" element={<RecipePage />} />
        <Route path="/grocery" element={<GroceryListPage />} />
      </Routes>
    </Router>
  );
}

export default App;
