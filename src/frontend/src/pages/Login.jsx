import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";


export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true); // state to switch between login/signup
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [accountError, setAccountError] = useState(false);

  const message = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? "login" : "signup";
    const url = `http://localhost:8080/api/auth/${endpoint}`;

    let res;


    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      if (isLogin) {
        navigate("/dashboard");
      }
      else {
        navigate("/dashboard");
        localStorage.setItem("onboarding", true);
        localStorage.setItem("email", email);
      }
      setPasswordError(false);
      {/* If any error occurs, from status, change error */ }
    } else if (isLogin && res.status === 403) {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 3000);
    } else if (!isLogin && res.status === 400) {
      setAccountError(true);
      setTimeout(() => setAccountError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a4d1d4] to-[#628d45] p-4 sm:p-6">
      <div className="flex flex-col md:flex-row rounded-2xl shadow-xl overflow-hidden max-w-sm md:max-w-4xl w-full">
        {/* Create rounded div with image and text */}
        <div className="bg-black bg-opacity-20 text-white flex flex-col items-center justify-center p-6 md:p-8 w-full md:w-1/2 text-center">
          <img
            src="/grocery.png"
            alt="Groceries"
            className="w-32 h-32 md:w-48 md:h-48 object-contain mb-4 md:mb-6"
          />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3">Welcome to Pantry Assist</h2>
          <p className="text-sm sm:text-base md:text-lg">
            Your smart solution for grocery management.
          </p>
        </div>

        {/* Right side - Login/Signup form */}
        <div className="p-6 sm:p-8 md:p-10 w-full md:w-1/2 bg-white">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#334924] text-center mb-2 sm:mb-3">
            Pantry Assist
          </h1>
          <h2 className="text-base sm:text-lg md:text-xl text-gray-700 text-center mb-6 sm:mb-8">
            {isLogin ? "Welcome back!" : "Create your account"}
          </h2>
          {message && <p className="text-red-500 text-lg mb-2 text-center">{message}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-800 font-semibold mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#628d45] transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition ${passwordError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#628d45]"
                    }`}
                  placeholder="********"
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-2">
                    Invalid credentials. Please try again.
                  </p>
                )}
                {accountError && (
                  <p className="text-red-500 text-sm mt-2">
                    Account already exists. Please log in.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-600 hover:text-gray-900 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#628d45] text-white py-3 rounded-lg hover:bg-[#334924] transition-colors font-semibold text-lg"
            >
              {isLogin ? "Log In" : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-700">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#628d45] hover:underline font-semibold"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}