import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true); // state to switch between login/signup
   const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [accountError, setAccountError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? "login" : "signup";
    const url = `http://localhost:8080/api/auth/${endpoint}`;

let res;

if (isLogin) {
  res = await fetch(url, {
    method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  res = await fetch(url, {
    method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

if (res.ok) {
  const data = await res.json();
  localStorage.setItem("token", data.token); 
  if(isLogin) {
    navigate("/dashboard"); 
  }
  else {
    navigate("/onboarding"); 
  }
  setPasswordError(false);
  {/* If any error occurs, from status, change error */}
} else if (isLogin && res.status === 403) {
  setPasswordError(true);
  setTimeout(() => setPasswordError(false), 3000);
} else if (!isLogin && res.status === 400) {
  setAccountError(true);
  setTimeout(() => setAccountError(false), 3000);
}
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#507e4f] to-[#41983e] p-6">
  <div className="flex bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full">
    {/* Create rounded div with image and text */}
    <div className="bg-green-600 text-white flex flex-col items-center justify-center p-8 w-1/2">
      <img
        src="/grocery.png"
        alt="Groceries"
        className="w-30 h-30 object-contain mb-5"
      />
      <h2 className="text-3xl font-semibold mb-2">Welcome to PantryAssist</h2>
      <p className="text-center text-md">
        Track your groceries, save money, and reduce waste!
      </p>
    </div>

    {/* Right side - Login/Signup form */}
    <div className="p-8 w-1/2 animate-fadeUp">
      <h1 className="text-3xl font-semibold text-gray-800 text-center mb-2">
        PantryAssist
      </h1>
      <h2 className="text-lg text-gray-600 text-center mb-6">
        {isLogin ? "Welcome back! Please log in." : "Join us today!"}
      </h2>

    {/* For each element, create a div and associated input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black-400"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                ${passwordError ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
              placeholder="********"
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">
                Invalid credentials, please try again.
              </p>
            )}
            {accountError && (
              <p className="text-red-500 text-sm mt-1">
                Account already exists, please use another or log in.
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold px-4 mt-3"
        >
          {isLogin ? "Log In" : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-center text-gray-500 p-">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-green-500 hover:underline"
        >
          {isLogin ? "Sign Up" : "Log In"}
        </button>
      </p>
    </div>
  </div>
</div>
  );
}